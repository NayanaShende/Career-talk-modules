import "./expert.css";

function SearchExperts() {
  return (
    <>
      <h1 className="page-title">Search Experts</h1>

      <input
        type="text"
        className="search-input"
        placeholder="Search by skill, domain, experience..."
      />

      <div className="card-grid">
        <div className="expert-card">
          <h3>Rahul Sharma</h3>
          <p>Frontend Developer (5 yrs)</p>
          <button>View Profile</button>
        </div>

        <div className="expert-card">
          <h3>Anita Verma</h3>
          <p>Backend Developer (7 yrs)</p>
          <button>View Profile</button>
        </div>

        <div className="expert-card">
          <h3>Amit Singh</h3>
          <p>Data Scientist (6 yrs)</p>
          <button>View Profile</button>
        </div>
      </div>
    </>
  );
}

export default SearchExperts;
