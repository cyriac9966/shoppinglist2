import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/shoppingListDetail.css";

const LOGGED_USER_ID = "u1"; // aktuálně přihlášený uživatel

// Výchozí nákupní seznamy – po reloadu stránky se vrátí výchozí stav
const INITIAL_LISTS = [
    {
        id: "list-1",
        name: "Red Wedding Feast",
        description: "Nákupní seznam pro velkou hostinu.",
        archived: false,
        ownerId: "u1",
        ownerName: "Arya Stark",
        itemCount: 8,
        memberCount: 5,
    },
    {
        id: "list-2",
        name: "Týdenní nákup Winterfell",
        description: "Základní potraviny a zásoby na týden.",
        archived: false,
        ownerId: "u4",
        ownerName: "Jon Snow",
        itemCount: 12,
        memberCount: 4,
    },
    {
        id: "list-3",
        name: "Hostina v Králově přístavišti",
        description: "Větší nákup pro slavnostní hostinu.",
        archived: true,
        ownerId: "u3",
        ownerName: "Tyrion Lannister",
        itemCount: 10,
        memberCount: 3,
    },
];


let listsStore = INITIAL_LISTS;

function ShoppingListsRoute() {
    const location = useLocation();


    const [lists, setLists] = useState(() => listsStore);
    const [filter, setFilter] = useState("active"); // "active" | "all"

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const [listToDelete, setListToDelete] = useState(null);

    const filteredLists = lists.filter((list) =>
        filter === "active" ? !list.archived : true
    );

    const handleOpenAddModal = () => setIsAddModalOpen(true);

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setNewName("");
        setNewDescription("");
    };

    const handleAddList = (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;

        const newList = {
            id: `list-${Date.now()}`,
            name,
            description: newDescription.trim() || "Nový nákupní seznam.",
            archived: false,
            ownerId: LOGGED_USER_ID,
            ownerName: "Arya Stark",
            itemCount: 0,
            memberCount: 1, // jen owner
        };

        setLists((prev) => {
            const updated = [newList, ...prev];
            listsStore = updated; // uložíme i do „globální“ proměnné
            return updated;
        });

        handleCloseAddModal();
    };

    const handleRequestDelete = (list) => {
        // smazat může jen vlastník seznamu
        if (list.ownerId !== LOGGED_USER_ID) return;
        setListToDelete(list);
    };

    const handleConfirmDelete = () => {
        if (!listToDelete) return;
        setLists((prev) => {
            const updated = prev.filter((l) => l.id !== listToDelete.id);
            listsStore = updated; // aktualizace úložiště
            return updated;
        });
        setListToDelete(null);
    };

    const handleCancelDelete = () => setListToDelete(null);

    // aktualizace počtu položek/členů
    useEffect(() => {
        const updated = location.state && location.state.updatedList;
        if (!updated) return;

        setLists((prev) => {
            const mapped = prev.map((list) =>
                list.id === updated.id
                    ? {
                        ...list,
                        name: updated.name,
                        itemCount: updated.itemCount,
                        memberCount: updated.memberCount,
                    }
                    : list
            );
            listsStore = mapped;
            return mapped;
        });
    }, [location.state]);

    return (
        <div className="page">
            <div className="card">
                {/* horní řádek – breadcrumb + tlačítko */}
                <div className="card-top-row">
                    <div>
                        <div className="breadcrumb">Nákupní seznamy</div>
                        <h1 className="list-title">Přehled nákupních seznamů</h1>
                    </div>
                    <button
                        type="button"
                        className="btn add-btn"
                        onClick={handleOpenAddModal}
                    >
                        + Nový nákupní seznam
                    </button>
                </div>

                {/* filtr */}
                <div className="items-summary" style={{ marginBottom: 12 }}>
                    <button
                        type="button"
                        className="btn small"
                        style={{
                            marginRight: 8,
                            backgroundColor: filter === "active" ? "#0f172a" : "#e5e7eb",
                            color: filter === "active" ? "#ffffff" : "#111827",
                        }}
                        onClick={() => setFilter("active")}
                    >
                        Pouze aktivní seznamy
                    </button>
                    <button
                        type="button"
                        className="btn small"
                        style={{
                            backgroundColor: filter === "all" ? "#0f172a" : "#e5e7eb",
                            color: filter === "all" ? "#ffffff" : "#111827",
                        }}
                        onClick={() => setFilter("all")}
                    >
                        Všechny seznamy
                    </button>
                </div>


                <div className="lists-grid">
                    {filteredLists.map((list) => {
                        const isOwner = list.ownerId === LOGGED_USER_ID;
                        const isNew = list.itemCount === 0 && list.memberCount === 1;

                        return (
                            <Link
                                key={list.id}
                                to={`/shopping-list/${list.id}`}
                                state={{
                                    listName: list.name,
                                    isNew,
                                    id: list.id,
                                }}
                                className="list-tile-link"
                            >
                                <div className="list-tile">
                                    <div className="list-tile-header">
                                        <h2 className="list-tile-title">{list.name}</h2>
                                        {isOwner && (
                                            <button
                                                type="button"
                                                className="icon-btn"
                                                title="Smazat seznam"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRequestDelete(list);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                    <p className="list-tile-description">{list.description}</p>
                                    <div className="list-tile-meta">
                    <span>
                      Vlastník: <strong>{list.ownerName}</strong>
                        {isOwner && " (ty)"}
                    </span>
                                        <span>
                      Položky: <strong>{list.itemCount}</strong>
                    </span>
                                        <span>
                      Členové: <strong>{list.memberCount}</strong>
                    </span>
                                    </div>
                                    {list.archived && (
                                        <div className="list-tile-badge">Archivovaný seznam</div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    {filteredLists.length === 0 && (
                        <p style={{ fontSize: 14, color: "#6b7280" }}>
                            Žádné nákupní seznamy k zobrazení.
                        </p>
                    )}
                </div>
            </div>

            {/* modal – nový seznam */}
            {isAddModalOpen && (
                <div className="modal-backdrop">
                    <div className="card modal-card">
                        <h2 className="list-title">Nový nákupní seznam</h2>
                        <form onSubmit={handleAddList}>
                            <div className="add-row">
                                <input
                                    className="add-input"
                                    type="text"
                                    placeholder="Název seznamu (např. Týdenní nákup)"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="add-row">
                <textarea
                    className="add-input"
                    rows={3}
                    placeholder="Krátký popis seznamu (např. běžný nákup, velká hostina...)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn small"
                                    onClick={handleCloseAddModal}
                                >
                                    Zrušit
                                </button>
                                <button type="submit" className="btn add-btn small">
                                    Uložit seznam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* potvrzovací dialog smazání */}
            {listToDelete && (
                <div className="modal-backdrop">
                    <div className="card modal-card">
                        <h3 className="list-title">Smazat nákupní seznam?</h3>
                        <p style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>
                            Opravdu chceš nenávratně smazat seznam{" "}
                            <strong>{listToDelete.name}</strong>?
                        </p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn small"
                                onClick={handleCancelDelete}
                            >
                                Ne, ponechat
                            </button>
                            <button
                                type="button"
                                className="btn small"
                                style={{ backgroundColor: "#ef4444", color: "white" }}
                                onClick={handleConfirmDelete}
                            >
                                Ano, smazat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShoppingListsRoute;
