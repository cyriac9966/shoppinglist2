import React, { useState } from "react";
import "../styles/shoppingListDetail.css";

// Výchozí data
const INITIAL_SHOPPING_LIST = {
    id: "list-1",
    name: "Red Wedding Feast",
    owner: {
        id: "u1",
        name: "Arya Stark",
    },
    members: [
        { id: "u1", name: "Arya Stark", initials: "AS" },
        { id: "u2", name: "Daenerys Targaryen", initials: "DT" },
        { id: "u3", name: "Tyrion Lannister", initials: "TL" },
        { id: "u4", name: "Jon Snow", initials: "JS" },
        { id: "u5", name: "Sansa Stark", initials: "SS" },
    ],
    items: [
        {
            id: "i1",
            name: "Lemon Cakes",
            done: false,
            createdById: "u2",
            createdAt: "2025-01-01T10:00:00Z",
            completedById: null,
            completedAt: null,
        },
        {
            id: "i2",
            name: "Roasted Boar",
            done: false,
            createdById: "u3",
            createdAt: "2025-01-02T09:30:00Z",
            completedById: null,
            completedAt: null,
        },
        {
            id: "i3",
            name: "Honeyed Chicken",
            done: false,
            createdById: "u1",
            createdAt: "2025-01-03T14:15:00Z",
            completedById: null,
            completedAt: null,
        },
        {
            id: "i4",
            name: "Fresh Bread & Salt",
            done: true,
            createdById: "u4",
            createdAt: "2025-01-01T08:00:00Z",
            completedById: "u1",
            completedAt: "2025-01-04T12:00:00Z",
        },
        {
            id: "i5",
            name: "Dornish Wine",
            done: true,
            createdById: "u5",
            createdAt: "2025-01-02T11:00:00Z",
            completedById: "u3",
            completedAt: "2025-01-05T18:20:00Z",
        },
        {
            id: "i6",
            name: "Venison Stew",
            done: false,
            createdById: "u2",
            createdAt: "2025-01-03T10:45:00Z",
            completedById: null,
            completedAt: null,
        },
        {
            id: "i7",
            name: "Pigeon Pie",
            done: false,
            createdById: "u1",
            createdAt: "2025-01-04T09:10:00Z",
            completedById: null,
            completedAt: null,
        },
        {
            id: "i8",
            name: "Blackberry Tart",
            done: true,
            createdById: "u5",
            createdAt: "2025-01-01T16:00:00Z",
            completedById: "u2",
            completedAt: "2025-01-06T19:45:00Z",
        },
    ],
};

function ShoppingListDetailRoute() {
    const [shoppingList, setShoppingList] = useState(INITIAL_SHOPPING_LIST);

    // všichni "známí" uživatelé (v tomto úkolu jen initial members)
    const [knownUsers] = useState(INITIAL_SHOPPING_LIST.members);

    // aktuálně "přihlášený" uživatel – přepínáme v rohu karty
    const [currentUserId, setCurrentUserId] = useState("u1"); // u1 = owner, u3 = člen...

    // název seznamu – editace
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(INITIAL_SHOPPING_LIST.name);

    // položky
    const [newItemName, setNewItemName] = useState("");
    const [showOnlyUndone, setShowOnlyUndone] = useState(false);

    // členové – dropdown
    const [membersOpen, setMembersOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");

    // detail položky
    const [selectedItemId, setSelectedItemId] = useState(null);

    const currentUser = knownUsers.find((u) => u.id === currentUserId) || null;

    // role vůči aktuálnímu seznamu
    const isOwner = shoppingList.owner.id === currentUserId;
    const isMember = shoppingList.members.some((m) => m.id === currentUserId);
    const isFormerMember = !!currentUser && !isMember && !isOwner;

    const getUserNameById = (id) =>
        knownUsers.find((u) => u.id === id)?.name || "Unknown";

    const formatDateTime = (isoString) => {
        if (!isoString) return "-";
        try {
            return new Date(isoString).toLocaleString();
        } catch {
            return isoString;
        }
    };

    // --- ITEMS LOGIKA ---

    const visibleItems = shoppingList.items.filter((item) =>
        showOnlyUndone ? !item.done : true
    );

    const totalCount = shoppingList.items.length;
    const doneCount = shoppingList.items.filter((item) => item.done).length;
    const activeCount = totalCount - doneCount;

    const selectedItem =
        shoppingList.items.find((item) => item.id === selectedItemId) || null;

    const handleToggleItem = (itemId) => {
        if (!isMember) return; // pouze člen (včetně ownera)
        setShoppingList((prev) => ({
            ...prev,
            items: prev.items.map((item) => {
                if (item.id !== itemId) return item;

                // přepínání done + metadata
                if (!item.done) {
                    return {
                        ...item,
                        done: true,
                        completedById: currentUserId,
                        completedAt: new Date().toISOString(),
                    };
                } else {
                    return {
                        ...item,
                        done: false,
                        completedById: null,
                        completedAt: null,
                    };
                }
            }),
        }));
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!isMember) return;

        const trimmed = newItemName.trim();
        if (!trimmed) return;

        const newItem = {
            id: `i-${Date.now()}`,
            name: trimmed,
            done: false,
            createdById: currentUserId,
            createdAt: new Date().toISOString(),
            completedById: null,
            completedAt: null,
        };

        setShoppingList((prev) => ({
            ...prev,
            items: [...prev.items, newItem],
        }));
        setNewItemName("");
    };

    const handleRemoveItem = (itemId) => {
        if (!isMember) return;
        setShoppingList((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));

        // když smažu item, který je zrovna vybraný v detailu, detail zavřu
        if (selectedItemId === itemId) {
            setSelectedItemId(null);
        }
    };

    // --- TITLE / NAME ---

    const startEditTitle = () => {
        if (!isOwner) return;
        setEditTitle(shoppingList.name);
        setIsEditingTitle(true);
    };

    const handleTitleSave = () => {
        if (!isOwner) return;
        const trimmed = editTitle.trim();
        if (!trimmed) {
            setIsEditingTitle(false);
            return;
        }
        setShoppingList((prev) => ({ ...prev, name: trimmed }));
        setIsEditingTitle(false);
    };

    const handleTitleCancel = () => {
        setEditTitle(shoppingList.name);
        setIsEditingTitle(false);
    };

    // --- MEMBERS ---

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!isOwner) return;

        const trimmed = newMemberName.trim();
        if (!trimmed) return;

        // hledání uživatele podle jména
        const existingUser = knownUsers.find((u) => u.name === trimmed);

        if (!existingUser) {
            alert("User with this name does not exist, cannot be added.");
            return;
        }

        // pokud už je členem
        const alreadyMember = shoppingList.members.some(
            (m) => m.id === existingUser.id
        );
        if (alreadyMember) {
            alert("This user is already a member of the list.");
            setNewMemberName("");
            return;
        }

        setShoppingList((prev) => ({
            ...prev,
            members: [...prev.members, existingUser],
        }));
        setNewMemberName("");
    };

    const handleRemoveMember = (memberId) => {
        if (!isOwner) return;

        if (memberId === shoppingList.owner.id) {
            alert("Owner of the list cannot be removed.");
            return;
        }

        setShoppingList((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== memberId),
        }));
    };

    const handleLeaveList = () => {
        if (!isMember) return;

        if (isOwner) {
            alert("Owner cannot leave their own list.");
            return;
        }

        setShoppingList((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== currentUserId),
        }));
    };

    //  USER SWITCHER

    const handleUserChange = (e) => {
        setCurrentUserId(e.target.value);
        setMembersOpen(false);
        setIsEditingTitle(false);
    };

    const handleSelectItemDetails = (itemId) => {
        setSelectedItemId((prev) => (prev === itemId ? null : itemId));
    };

    return (
        <div className="page">
            <div className="card">
                <div className="card-top-row">
                    <div className="user-switcher">
                        <label>
                            User:&nbsp;
                            <select value={currentUserId} onChange={handleUserChange}>
                                {knownUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* Název seznamu – tužka jen pro owner */}
                <div className="title-row">
                    {isEditingTitle && isOwner ? (
                        <>
                            <input
                                className="title-input"
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={handleTitleSave}
                                title="Save"
                            >
                                ✔
                            </button>
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={handleTitleCancel}
                                title="Cancel"
                            >
                                ✖
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="list-title">{shoppingList.name}</h1>
                            {isOwner && (
                                <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={startEditTitle}
                                    title="Edit name"
                                >
                                    ✏️
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Owner + bubliny členů */}
                <div className="owner-row">
                    <div>
                        <div className="owner-label">
                            Owner: <strong>{shoppingList.owner.name}</strong>
                        </div>
                        <div className="members-row">
                            {shoppingList.members.slice(0, 4).map((m) => (
                                <div
                                    key={m.id}
                                    className={
                                        "member-pill" + (m.id === currentUserId ? " you" : "")
                                    }
                                >
                                    {m.initials}
                                </div>
                            ))}

                            <button
                                type="button"
                                className="more-members-btn"
                                onClick={() => setMembersOpen((o) => !o)}
                            >
                                Members ({shoppingList.members.length}){" "}
                                {membersOpen ? "▴" : "▾"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dropdown s členy  */}
                {membersOpen && (
                    <div className="members-dropdown-body">
                        <ul className="members-dropdown-list">
                            {shoppingList.members.map((m) => {
                                const isThisUser = m.id === currentUserId;
                                const isThisOwner = m.id === shoppingList.owner.id;

                                return (
                                    <li key={m.id} className="members-dropdown-item">
                    <span>
                      {m.name}
                        {isThisOwner && " (owner)"}
                        {isThisUser && " (you)"}
                    </span>
                                        <div className="member-actions">
                                            {/* běžný člen moznost odchodu */}
                                            {isMember &&
                                                !isOwner &&
                                                isThisUser &&
                                                !isThisOwner && (
                                                    <button
                                                        type="button"
                                                        className="btn small"
                                                        onClick={handleLeaveList}
                                                    >
                                                        Leave
                                                    </button>
                                                )}

                                            {/* owner – možnost mazat */}
                                            {isOwner && !isThisOwner && (
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    onClick={() => handleRemoveMember(m.id)}
                                                    title="Remove member"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Přidání člena – jen owner, jen pokud jméno existuje v knownUsers */}
                        {isOwner && (
                            <form className="add-member-row" onSubmit={handleAddMember}>
                                <input
                                    type="text"
                                    placeholder="Existing user name..."
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                />
                                <button type="submit" className="btn small">
                                    Add
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Info o přihlášeném + režim */}
                <p className="current-user">
                    You are:{" "}
                    <strong>{currentUser ? currentUser.name : "Unknown"}</strong>
                    {isOwner && " (owner)"}
                    {!isOwner && isMember && " (member)"}
                    {isFormerMember &&
                        " (not a member of this list anymore – read only)"}
                </p>

                {/* Leave list – pro člena, který není owner */}
                {isMember && !isOwner && (
                    <button
                        type="button"
                        className="btn small leave-btn"
                        onClick={handleLeaveList}
                    >
                        Leave list
                    </button>
                )}

                {/* Přidání položky */}
                <form className="add-row" onSubmit={handleAddItem}>
                    <input
                        className="add-input"
                        type="text"
                        placeholder={
                            isMember
                                ? "Add a new item..."
                                : "You cannot add items (read only)"
                        }
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        disabled={!isMember}
                    />
                    <button
                        type="submit"
                        className="btn add-btn"
                        disabled={!isMember}
                    >
                        + Add
                    </button>
                </form>

                {/* Filtr */}
                <label className="toggle-row">
                    <input
                        type="checkbox"
                        checked={showOnlyUndone}
                        onChange={(e) => setShowOnlyUndone(e.target.checked)}
                    />
                    <span>Show only undone items</span>
                </label>

                {/* Souhrn počtů položek */}
                <div className="items-summary">
                    Total: <strong>{totalCount}</strong> • Active:{" "}
                    <strong>{activeCount}</strong> • Done:{" "}
                    <strong>{doneCount}</strong>
                </div>

                {/* Položky – klik i koš fungují jen, pokud je user člen */}
                <div className="items-grid">
                    {visibleItems.map((item) => (
                        <div
                            key={item.id}
                            className={"item-pill" + (item.done ? " done" : "")}
                        >
                            <button
                                type="button"
                                className="item-main"
                                onClick={
                                    isMember ? () => handleToggleItem(item.id) : undefined
                                }
                            >
                                {item.name}
                            </button>

                            {/* info o položce – vždy dostupné */}
                            <button
                                type="button"
                                className="icon-btn item-info-btn"
                                onClick={() => handleSelectItemDetails(item.id)}
                                title="Show details"
                            >
                                ℹ️
                            </button>

                            {isMember && (
                                <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={() => handleRemoveItem(item.id)}
                                    title="Remove item"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Panel s detailem položky */}
                {selectedItem && (
                    <div className="item-details-panel">
                        <div className="item-details-row">
                            <span className="item-details-label">Item:</span>{" "}
                            {selectedItem.name}
                        </div>
                        <div className="item-details-row">
                            <span className="item-details-label">Created:</span>{" "}
                            {formatDateTime(selectedItem.createdAt)}{" "}
                            by{" "}
                            {selectedItem.createdById
                                ? getUserNameById(selectedItem.createdById)
                                : "Unknown"}
                        </div>
                        <div className="item-details-row">
                            <span className="item-details-label">Status:</span>{" "}
                            {selectedItem.done ? (
                                <>
                                    Completed on{" "}
                                    {formatDateTime(selectedItem.completedAt)} by{" "}
                                    {selectedItem.completedById
                                        ? getUserNameById(selectedItem.completedById)
                                        : "Unknown"}
                                </>
                            ) : (
                                "Still active"
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShoppingListDetailRoute;
