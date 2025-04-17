import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ListaDeCompras = () => {
  const initialItems = JSON.parse(localStorage.getItem("listaDeCompras")) || [];
  const [items, setItems] = useState(initialItems);
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [editItemId, setEditItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const containerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("listaDeCompras", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (editItemId !== null && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editItemId]);

  const handleAddItem = () => {
    if (itemName && itemValue && itemQuantity) {
      const newItem = {
        id: items.length > 0 ? items[items.length - 1].id + 1 : 1,
        name: itemName,
        value: parseFloat(itemValue),
        quantity: parseInt(itemQuantity),
      };

      if (editItemId !== null) {
        const updatedItems = items.map((item) =>
          item.id === editItemId ? { ...newItem, id: editItemId } : item
        );
        setItems(updatedItems);
        setEditItemId(null);
      } else {
        setItems([...items, newItem]);
      }

      setItemName("");
      setItemValue("");
      setItemQuantity("");
    }
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleEditItem = (id) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setItemName(itemToEdit.name);
      setItemValue(itemToEdit.value.toString());
      setItemQuantity(itemToEdit.quantity.toString());
      setEditItemId(id);
    }
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
    if (sortField) {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      if (sortDirection === "asc") {
        return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
      } else {
        return fieldA < fieldB ? 1 : fieldA > fieldB ? -1 : 0;
      }
    } else {
      return 0;
    }
  });

  const filteredItems = sortedItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.value * item.quantity, 0);
  };

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "1em" }}>
        <h1 style={{ color: "#036db8", fontWeight: "bold" }}>Lista de Compras</h1>
      </div>
      <div>
        <TextField
          label="Nome do item"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          size="small"
          style={{ width: 150 }}
        />
        <TextField
          label="Valor"
          type="number"
          value={itemValue}
          onChange={(e) => setItemValue(e.target.value)}
          size="small"
          style={{ width: 70 }}
        />
        <TextField
          label="Quantidade"
          type="number"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          size="small"
          style={{ width: 70 }}
        />
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={handleAddItem}
          startIcon={editItemId !== null ? <CheckIcon /> : <AddIcon />}
          style={{ marginLeft: 10 }}
        />
      </div>
      <div>
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
              <TableCell onClick={() => handleSort("id")}>
                ID {sortField === "id" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableCell>
              <TableCell onClick={() => handleSort("name")}>
                Nome {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableCell>
              <TableCell onClick={() => handleSort("value")}>
                Valor {sortField === "value" && (sortDirection === "asc" ? "▲" : "▼")}
              </TableCell>
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
                <TableCell>
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
      <div style={{
        position: "fixed",
        bottom: 40,
        left: 10,
        backgroundColor: "transparent",
        padding: 10,
        borderRadius: "50%",
        width: 60,
        height: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#3498db",
      }}>
        <Typography variant="h6" style={{fontWeight: "bold", fontSize: 20}}>
          <b>R${calculateTotal().toFixed(2)}</b>
        </Typography>
      </div>
    </div>
  );
};

export default ListaDeCompras;


