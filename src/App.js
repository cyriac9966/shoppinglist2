import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShoppingListsRoute from "./routes/ShoppingListsRoute";
import ShoppingListDetailRoute from "./routes/ShoppingListDetailRoute";
import "./styles/shoppingListDetail.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Úvodní obrazovka – přehled seznamů */}
                <Route path="/" element={<ShoppingListsRoute />} />

                {/* Detail jednoho seznamu */}
                <Route path="/shopping-list/:id" element={<ShoppingListDetailRoute />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
