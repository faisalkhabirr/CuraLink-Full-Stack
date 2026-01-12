import React, { useState } from "react";
import "./GetStartedSection.css";

function GetStartedSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    warnings: "",
    source: "",
  });

  const fetchJson = async (url, options) => {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
  };

  // SEARCH
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const data = await fetchJson(
        `/api/search?q=${encodeURIComponent(searchTerm)}`
      );
      setResults(data.length > 0 ? data[0] : null);
    } catch (err) {
      alert(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // MODAL
  const openModal = (type) => {
    setModalType(type);
    if (type === "update" && results) {
      setFormData({
        name: results.name,
        purpose: results.purpose,
        warnings: results.warnings,
        source: results.source,
      });
    } else if (type === "add") {
      setFormData({ name: "", purpose: "", warnings: "", source: "MongoDB" });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ADD
  const handleAdd = async () => {
    const data = await fetchJson(`/api/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setResults(data);
    setSearchTerm(data.name);
    setShowModal(false);
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!results?._id) return;
    const data = await fetchJson(`/api/medicines/${results._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setResults(data);
    setShowModal(false);
  };

  // DELETE
  const handleDelete = async () => {
    if (!results?._id) return;
    await fetchJson(`/api/medicines/${results._id}`, { method: "DELETE" });
    setResults(null);
    setSearchTerm("");
    setShowModal(false);
  };

  return (
    <section className="getStartedContainer">
      <div className="getStartedWrapper">
        <h2 className="getStartedTitle">
          <span className="highlightTeal">Get Started:</span> Find Drug Clarity Now
        </h2>

        <p className="getStartedSubtitle">
          Instantly search our verified database for plain-language explanations,
          side effects, and warnings.
        </p>

        <form className="medSearchForm" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
          />
          <button type="submit" className="searchButton">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {results && (
          <div className="searchResultsBox">
            <h3>{results.name}</h3>
            <p><strong>Purpose:</strong> {results.purpose}</p>
            {results.warnings && (
              <p><strong>Warnings:</strong> {results.warnings}</p>
            )}
            {results.source && <p><em>Source: {results.source}</em></p>}
          </div>
        )}

        <div className="quickLinks">
          <button
            className="quickLinkItem"
            onClick={() => openModal("update")}
            disabled={!results}
          >
            Update Effects/Side effects
          </button>

          <button
            className="quickLinkItem"
            onClick={() => openModal("add")}
          >
            Add Drug Info
          </button>

          {results && (
            <button
              className="quickLinkItem"
              onClick={() => openModal("delete")}
            >
              Delete Drug Info
            </button>
          )}
        </div>

        {showModal && (
          <div className="modalOverlay" onClick={() => setShowModal(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              {modalType === "delete" ? (
                <>
                  <h3>Delete {results?.name}?</h3>
                  <button onClick={handleDelete}>Confirm Delete</button>
                  <button onClick={() => setShowModal(false)}>Cancel</button>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    modalType === "add" ? handleAdd() : handleUpdate();
                  }}
                  className="modalForm"
                >
                  <h3>
                    {modalType === "add" ? "Add Medicine" : "Update Medicine"}
                  </h3>

                  <input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    name="purpose"
                    placeholder="Purpose"
                    value={formData.purpose}
                    onChange={handleFormChange}
                  />
                  <input
                    name="warnings"
                    placeholder="Warnings"
                    value={formData.warnings}
                    onChange={handleFormChange}
                  />
                  <input
                    name="source"
                    placeholder="Source"
                    value={formData.source}
                    onChange={handleFormChange}
                  />

                  <div className="modalButtons">
                    <button type="submit">
                      {modalType === "add" ? "Add" : "Update"}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GetStartedSection;
