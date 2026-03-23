import React, { useState } from "react";
import "./GetStartedSection.css";
import { apiGet, apiSend } from "../api";

function GetStartedSection() {
  const [searchMode, setSearchMode] = useState("medicine");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aiMedicine, setAiMedicine] = useState(null);
  const [aiSymptoms, setAiSymptoms] = useState(null);
  const [aiError, setAiError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    warnings: "",
    source: "",
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setAiError(null);

    try {
      if (searchMode === "medicine") {
        setAiSymptoms(null);
        let medData = null;
        try {
          medData = await apiGet(
            `/api/ai/medicine?q=${encodeURIComponent(searchTerm)}`
          );
          setAiMedicine(medData);
        } catch (err) {
          setAiMedicine(null);
          setAiError(err.message || "Could not load AI insight");
        }

        try {
          const dbRows = await apiGet(
            `/api/search?q=${encodeURIComponent(searchTerm)}`
          );
          setResults(dbRows.length > 0 ? dbRows[0] : null);
        } catch {
          setResults(null);
        }
      } else {
        setAiMedicine(null);
        setResults(null);
        const symData = await apiGet(
          `/api/ai/symptoms?q=${encodeURIComponent(searchTerm)}`
        );
        setAiSymptoms(symData);
      }
    } catch (err) {
      setAiSymptoms(null);
      setAiError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);

    if (type === "update" && results) {
      setFormData({
        name: results.name || "",
        purpose: results.purpose || "",
        warnings: results.warnings || "",
        source: results.source || "MongoDB",
      });
    } else if (type === "add") {
      setFormData({ name: "", purpose: "", warnings: "", source: "MongoDB" });
    }

    setShowModal(true);
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    try {
      const data = await apiSend("/api/medicines", "POST", formData);
      setResults(data);
      setSearchTerm(data.name);
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Add failed");
    }
  };

  const handleUpdate = async () => {
    if (!results?._id) return;

    try {
      const data = await apiSend(`/api/medicines/${results._id}`, "PUT", formData);
      setResults(data);
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!results?._id) return;

    try {
      await apiSend(`/api/medicines/${results._id}`, "DELETE");
      setResults(null);
      setSearchTerm("");
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <section className="getStartedContainer">
      <div className="getStartedWrapper">
        <h2 className="getStartedTitle">
          <span className="highlightTeal">Get Started:</span> Find Drug Clarity Now
        </h2>

        <p className="getStartedSubtitle">
          {searchMode === "medicine"
            ? "Search by medication name for AI-sourced educational summaries: how it works, benefits, risks, and typical dosing notes by use."
            : "Describe your symptoms to see which type of clinician may be appropriate and general supportive steps — not a diagnosis."}
        </p>

        <div className="searchModeToggle" role="tablist" aria-label="Search type">
          <button
            type="button"
            role="tab"
            aria-selected={searchMode === "medicine"}
            className={`searchModeBtn ${searchMode === "medicine" ? "active" : ""}`}
            onClick={() => {
              setSearchMode("medicine");
              setAiSymptoms(null);
              setAiError(null);
            }}
          >
            Medicine name
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={searchMode === "symptoms"}
            className={`searchModeBtn ${searchMode === "symptoms" ? "active" : ""}`}
            onClick={() => {
              setSearchMode("symptoms");
              setAiMedicine(null);
              setAiError(null);
            }}
          >
            Symptoms
          </button>
        </div>

        <form className="medSearchForm" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={
              searchMode === "medicine"
                ? "Search for a medication..."
                : "Describe your symptoms (e.g. sharp chest pain when breathing)..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
          />
          <button type="submit" className="searchButton">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {aiError && (
          <div className="searchResultsBox aiNotice errorNotice">
            <p>{aiError}</p>
          </div>
        )}

        {aiMedicine && searchMode === "medicine" && (
          <div className="searchResultsBox aiInsightCard">
            <h3>{aiMedicine.medicineName || "Medication insight"}</h3>
            <p className="aiSectionLabel">How it works</p>
            <p>{aiMedicine.howItWorks}</p>

            <p className="aiSectionLabel">Benefits / common uses</p>
            <ul className="aiBulletList">
              {(aiMedicine.benefits || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <p className="aiSectionLabel">Risks & side effects</p>
            <ul className="aiBulletList aiRiskList">
              {(aiMedicine.risksAndSideEffects || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <p className="aiSectionLabel">Dosing notes by condition or use</p>
            <ul className="aiDosageList">
              {(aiMedicine.dosageByCondition || []).map((row, i) => (
                <li key={i}>
                  <strong>{row.conditionOrUse}</strong>
                  <span>{row.typicalDosingNotes}</span>
                </li>
              ))}
            </ul>

            {aiMedicine.disclaimer && (
              <p className="aiDisclaimer">{aiMedicine.disclaimer}</p>
            )}
          </div>
        )}

        {aiSymptoms && searchMode === "symptoms" && (
          <div className="searchResultsBox aiInsightCard">
            <h3>Symptom guidance</h3>
            {aiSymptoms.summaryOfSymptoms && (
              <>
                <p className="aiSectionLabel">Summary</p>
                <p>{aiSymptoms.summaryOfSymptoms}</p>
              </>
            )}

            <p className="aiSectionLabel">Types of doctors / clinics to consider</p>
            <ul className="aiSpecialtyList">
              {(aiSymptoms.suggestedSpecialties || []).map((s, i) => (
                <li key={i}>
                  <strong>{s.specialty}</strong>
                  <span>{s.reason}</span>
                </li>
              ))}
            </ul>

            <p className="aiSectionLabel">Primary care & general self-care ideas</p>
            <ul className="aiBulletList">
              {(aiSymptoms.primaryCareAndSelfCare || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            {aiSymptoms.whenToSeekUrgentCare && (
              <>
                <p className="aiSectionLabel">When to seek urgent or emergency care</p>
                <p className="aiUrgent">{aiSymptoms.whenToSeekUrgentCare}</p>
              </>
            )}

            {aiSymptoms.disclaimer && (
              <p className="aiDisclaimer">{aiSymptoms.disclaimer}</p>
            )}
          </div>
        )}

        {searchMode === "medicine" && results && (
          <div className="searchResultsBox dbRecordCard">
            <h3>Database record: {results.name}</h3>
            <p>
              <strong>Purpose:</strong> {results.purpose}
            </p>
            {results.warnings && (
              <p>
                <strong>Warnings:</strong> {results.warnings}
              </p>
            )}
            {results.source && (
              <p>
                <em>Source: {results.source}</em>
              </p>
            )}
          </div>
        )}

        {searchMode === "medicine" && (
          <div className="quickLinks">
            <button
              className="quickLinkItem"
              onClick={() => openModal("update")}
              disabled={!results}
            >
              Update Effects/Side effects
            </button>

            <button className="quickLinkItem" onClick={() => openModal("add")}>
              Add Drug Info
            </button>

            {results && (
              <button className="quickLinkItem" onClick={() => openModal("delete")}>
                Delete Drug Info
              </button>
            )}
          </div>
        )}

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
                  <h3>{modalType === "add" ? "Add Medicine" : "Update Medicine"}</h3>

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
                    <button type="submit">{modalType === "add" ? "Add" : "Update"}</button>
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
