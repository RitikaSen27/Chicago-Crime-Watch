export default function Footer() {
  return (
    <div className="ch-footer">
      <div className="ch-footer-row">
        <div className="ch-footer-col">
          <div className="ch-footer-title">Crime Watch</div>
          <div className="ch-footer-text">
            An independent student data-analysis project. Not affiliated
            with the City of Chicago or Chicago Police Department.
          </div>
        </div>
        <div className="ch-footer-col">
          <div className="ch-footer-title">Data Sources</div>
          <div className="ch-footer-text">Chicago Data Portal — Crimes, 2001–Present</div>
          <div className="ch-footer-text">NewsAPI.org — local news coverage</div>
        </div>
        <div className="ch-footer-col">
          <div className="ch-footer-title">Notes</div>
          <div className="ch-footer-text">
            All "last 30 days" figures are anchored to the most recent date
            in the dataset, not the current calendar date.
          </div>
        </div>
      </div>
      <div className="ch-footer-bottom">
        Built for academic purposes · Data updates each time the pipeline is re-run
      </div>
    </div>
  );
}
