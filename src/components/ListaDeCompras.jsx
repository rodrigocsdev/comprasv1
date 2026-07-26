import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './ListaDeCompras.css';

const ListaDeCompras = () => {
  const initialItems = JSON.parse(localStorage.getItem("listaDeCompras")) || [];
  const initialLists = JSON.parse(localStorage.getItem("listasDeCompras")) || [];

  const [items, setItems] = useState(initialItems);
  const [listas, setListas] = useState(initialLists);
  const [currentListId, setCurrentListId] = useState(null);
  const getToday = () => new Date().toISOString().slice(0, 10);
  const [newListName, setNewListName] = useState("");
  const [newListMarket, setNewListMarket] = useState("");
  const [newListDate, setNewListDate] = useState(getToday());
  const [isEditingList, setIsEditingList] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [compareResult, setCompareResult] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [editItemId, setEditItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeScreen, setActiveScreen] = useState("list");
  const [errors, setErrors] = useState({ newListName: false, itemName: false, itemQuantity: false });

  const containerRef = useRef(null);
  const currentList = listas.find((list) => list.id === currentListId) || null;

  useEffect(() => {
    localStorage.setItem("listaDeCompras", JSON.stringify(items));
    localStorage.setItem("listasDeCompras", JSON.stringify(listas));
  }, [items, listas]);

  useEffect(() => {
    if (listas.length === 0 && initialItems.length > 0) {
      const defaultList = {
        id: 1,
        name: "Lista padrão",
        market: "",
        date: new Date().toISOString().slice(0, 10),
        items: initialItems,
        finalized: false,
      };
      setListas([defaultList]);
      setCurrentListId(1);
      setActiveScreen("items");
    }
  }, [initialItems]);

  useEffect(() => {
    if (editItemId !== null && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editItemId]);

  const handleAddItem = () => {
    const missing = [];
    if (!itemName.trim()) {
      missing.push('Nome do item');
      setErrors((s) => ({ ...s, itemName: true }));
    }
    if (!itemQuantity || parseInt(itemQuantity, 10) <= 0) {
      missing.push('Quantidade');
      setErrors((s) => ({ ...s, itemQuantity: true }));
    }

    if (missing.length) {
      window.alert(`Preencha os campos obrigatórios: ${missing.join(', ')}`);
      setTimeout(() => setErrors((s) => ({ ...s, itemName: false, itemQuantity: false })), 2500);
      return;
    }

    const newItem = {
      id: items.length > 0 ? items[items.length - 1].id + 1 : 1,
      name: itemName,
      value: itemValue === "" ? 0 : parseFloat(itemValue),
      quantity: parseInt(itemQuantity, 10),
    };

    const nextItems = editItemId !== null
      ? items.map((item) => item.id === editItemId ? { ...newItem, id: editItemId } : item)
      : [...items, newItem];

    setItems(nextItems);
    setEditItemId(null);
    setItemName("");
    setItemValue("");
    setItemQuantity("1");
  };

  const handleCreateList = () => {
    if (!newListName.trim()) {
      setErrors((s) => ({ ...s, newListName: true }));
      window.alert('Por favor preencha o nome da lista.');
      setTimeout(() => setErrors((s) => ({ ...s, newListName: false })), 2500);
      return;
    }

    const id = listas.length > 0 ? listas[listas.length - 1].id + 1 : 1;
    const list = {
      id,
      name: newListName.trim(),
      market: newListMarket.trim(),
      date: newListDate || new Date().toISOString().slice(0, 10),
      items: [],
      finalized: false,
    };

    setListas([...listas, list]);
    setCurrentListId(id);
    setItems([]);
    setNewListName("");
    setNewListMarket("");
    setNewListDate(getToday());
    setIsEditingList(true);
    setActiveScreen("items");
  };

  const handleSelectList = (id) => {
    const list = listas.find((listItem) => listItem.id === parseInt(id, 10));
    if (!list) {
      setCurrentListId(null);
      setItems([]);
      setIsEditingList(false);
      setActiveScreen("list");
      return;
    }

    setCurrentListId(list.id);
    setItems(list.items || []);
    setIsEditingList(!list.finalized);
    setActiveScreen("items");
  };

  const handleSaveList = () => {
    if (!currentListId) return;
    const updated = listas.map((list) =>
      list.id === currentListId ? { ...list, items, finalized: list.finalized } : list
    );
    setListas(updated);
  };

  const handleFinalizeList = () => {
    if (!currentListId) return;
    const confirmed = window.confirm("Finalizar a lista? Após finalizar, não poderá mais editá-la. Deseja continuar?");
    if (!confirmed) return;

    const updated = listas.map((list) =>
      list.id === currentListId ? { ...list, items, finalized: true } : list
    );
    setListas(updated);
    setIsEditingList(false);
  };

  const handleDeleteList = (id) => {
    if (!id) return;
    const confirmed = window.confirm("Deseja realmente apagar essa lista? Esta ação não pode ser desfeita.");
    if (!confirmed) return;
    const updated = listas.filter((list) => list.id !== id);
    setListas(updated);
    if (currentListId === id) {
      setCurrentListId(null);
      setItems([]);
      setIsEditingList(false);
      setActiveScreen("list");
    }
  };

  const handleCompare = () => {
    if (!compareA || !compareB || compareA === compareB) return;

    const a = listas.find((list) => list.id === parseInt(compareA, 10));
    const b = listas.find((list) => list.id === parseInt(compareB, 10));
    if (!a || !b) return;

    const map = new Map();
    (a.items || []).forEach((item) => map.set(item.name, { name: item.name, a: item.value, b: null }));
    (b.items || []).forEach((item) => {
      if (map.has(item.name)) map.get(item.name).b = item.value;
      else map.set(item.name, { name: item.name, a: null, b: item.value });
    });

    const result = Array.from(map.values()).map((entry) => ({
      ...entry,
      diff: (entry.b === null ? 0 : entry.b) - (entry.a === null ? 0 : entry.a),
    }));

    setCompareResult({ a, b, rows: result });
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleClearList = () => {
    const confirmed = window.confirm("Tem certeza que deseja limpar a lista atual? Esta ação não pode ser desfeita.");
    if (!confirmed) return;

    setItems([]);
    setItemName("");
    setItemValue("");
    setItemQuantity("1");
    setEditItemId(null);
  };

  const handleEditItem = (id) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (!itemToEdit) return;

    setItemName(itemToEdit.name);
    setItemValue(itemToEdit.value.toString());
    setItemQuantity(itemToEdit.quantity.toString());
    setEditItemId(id);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortField) return 0;
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    if (fieldA === fieldB) return 0;
    return sortDirection === "asc" ? (fieldA > fieldB ? 1 : -1) : (fieldA < fieldB ? 1 : -1);
  });

  const filteredItems = sortedItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => items.reduce((total, item) => total + item.value * item.quantity, 0);

  return (
    <div ref={containerRef} className="lista-de-compras-root">
      <div className="screen-tabs">
        <button
          type="button"
          className={`tab ${activeScreen === 'list' ? 'active' : ''}`}
          onClick={() => setActiveScreen('list')}
        >
          Listas
        </button>
        <button
          type="button"
          className={`tab ${activeScreen === 'items' ? 'active' : ''}`}
          onClick={() => setActiveScreen('items')}
          disabled={!currentList}
        >
          Itens
        </button>
      </div>

      <div className={`screen-panel ${activeScreen === 'list' ? 'active' : 'hidden'}`}>
        <div className="lists-card">
          <div className="lists-bar">
            <div>
              <label style={{ fontWeight: 'bold' }}>Listas:</label>
              <select value={currentListId || ""} onChange={(e) => handleSelectList(e.target.value)}>
                <option value="">-- Selecionar lista --</option>
                {listas.map((list) => (
                  <option key={list.id} value={list.id}>
                    {`${list.name}${list.market ? ` - ${list.market}` : ''} (${list.date})${list.finalized ? ' [Finalizada]' : ''}`}
                  </option>
                ))}
              </select>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentListId(null);
                  setItems([]);
                  setIsEditingList(false);
                  setNewListDate(getToday());
                  setActiveScreen('list');
                }}
              >
                Nova
              </Button>
            </div>

            <div>
              <TextField className={errors.newListName ? 'required-pulse' : ''} label="Nome da lista" value={newListName} onChange={(e) => setNewListName(e.target.value)} size="small" />
              <TextField label="Mercado" value={newListMarket} onChange={(e) => setNewListMarket(e.target.value)} size="small" />
              <TextField label="Data" type="date" value={newListDate} onChange={(e) => setNewListDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
              <Button variant="contained" onClick={handleCreateList}>Criar e editar</Button>
              <Button variant="outlined" onClick={handleSaveList} disabled={!currentListId}>Salvar</Button>
              <Button variant="contained" color="success" onClick={handleFinalizeList} disabled={!currentListId || !isEditingList}>Finalizar lista</Button>
              <Button variant="outlined" color="error" onClick={() => handleDeleteList(currentListId)} disabled={!currentListId}>Apagar lista</Button>
            </div>
          </div>

          {currentList && (
            <div className="current-list-summary">
              <span>
                <strong>Lista atual:</strong> {currentList.name} {currentList.market ? `- ${currentList.market}` : ''} ({currentList.date}) {currentList.finalized ? '[Finalizada]' : ''}
              </span>
              <Button variant="text" onClick={() => setActiveScreen('items')}>
                Ver itens
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={`screen-panel ${activeScreen === 'items' ? 'active' : 'hidden'}`}>
        {!currentList ? (
          <div className="empty-state">
            <p>Selecione ou crie uma lista para adicionar produtos.</p>
            <Button variant="contained" onClick={() => setActiveScreen('list')}>Ir para telas de listas</Button>
          </div>
        ) : (
          <>
            <div className="product-header">
              <div>
                <h1>Lista de Compras</h1>
                <p>{currentList.name} {currentList.market ? `• ${currentList.market}` : ''} {currentList.date ? `• ${currentList.date}` : ''}</p>
              </div>
              <Button variant="outlined" onClick={() => setActiveScreen('list')}>Voltar</Button>
            </div>

            <div className="item-bar">
              <TextField
                className={errors.itemName ? 'required-pulse' : ''}
                label="Nome do item"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                size="small"
                style={{ minWidth: 140 }}
                disabled={!isEditingList}
              />
              <TextField
                label="Valor"
                type="number"
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
                inputProps={{ min: 0 }}
                size="small"
                style={{ width: 100 }}
                disabled={!isEditingList}
              />
              <TextField
                className={errors.itemQuantity ? 'required-pulse' : ''}
                label="Quantidade"
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                inputProps={{ min: 1 }}
                size="small"
                style={{ width: 100 }}
                disabled={!isEditingList}
              />
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={handleAddItem}
                startIcon={editItemId !== null ? <CheckIcon /> : <AddIcon />}
              >
                {editItemId !== null ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>

            <div className="actions-row">
              <Button size="small" variant="outlined" color="secondary" onClick={handleClearList}>
                Limpar lista
              </Button>
              <div className="compare-block">
                <strong>Comparar listas:</strong>
                <select value={compareA} onChange={(e) => setCompareA(e.target.value)} disabled={listas.length < 2}>
                  <option value="">-- Lista A --</option>
                  {listas.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <select value={compareB} onChange={(e) => setCompareB(e.target.value)} disabled={listas.length < 2}>
                  <option value="">-- Lista B --</option>
                  {listas.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <Button variant="outlined" onClick={handleCompare} disabled={listas.length < 2 || !compareA || !compareB}>
                  Comparar
                </Button>
              </div>
            </div>

            <div className="search-block">
              <TextField
                label="Pesquisar por nome"
                value={searchTerm}
                onChange={handleSearch}
                variant="outlined"
                fullWidth
                margin="normal"
                size="small"
              />
            </div>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell onClick={() => handleSort("id")}>ID {sortField === "id" && (sortDirection === "asc" ? "▲" : "▼")}</TableCell>
                    <TableCell onClick={() => handleSort("name")}>Nome {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}</TableCell>
                    <TableCell onClick={() => handleSort("value")}>Valor {sortField === "value" && (sortDirection === "asc" ? "▲" : "▼")}</TableCell>
                    <TableCell>Qtd</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>R${item.value.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R${(item.value * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="actions-cell">
                        <Button variant="contained" color="primary" onClick={() => handleEditItem(item.id)}>
                          <EditIcon />
                        </Button>
                        <Button variant="contained" color="error" onClick={() => handleRemoveItem(item.id)}>
                          <DeleteIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {compareResult && (
              <div className="compare-result">
                <h3>Comparação: {compareResult.a.name} x {compareResult.b.name}</h3>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>{compareResult.a.market || compareResult.a.date}</TableCell>
                        <TableCell>{compareResult.b.market || compareResult.b.date}</TableCell>
                        <TableCell>Diferença</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {compareResult.rows.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.a != null ? `R$${row.a.toFixed(2)}` : '-'}</TableCell>
                          <TableCell>{row.b != null ? `R$${row.b.toFixed(2)}` : '-'}</TableCell>
                          <TableCell>{`R$${row.diff.toFixed(2)}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </>
        )}
      </div>

      <div className="total-summary">
        <Typography variant="h6" style={{ fontWeight: "bold", fontSize: 18 }}>
          Total: R${calculateTotal().toFixed(2)}
        </Typography>
      </div>
    </div>
  );
};

export default ListaDeCompras;


