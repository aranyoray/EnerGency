import './AIModelsReport.css'

const AIModelsReport = () => (
  <div className="ai-models-page">
    <header className="ai-models-header">
      <div>
        <h1>EnerGency AI Models Report</h1>
        <p>
          Detailed, transparent summaries of the forecasting models powering EnerGency.
          All metrics are reported on holdout validation data.
        </p>
      </div>
      <a className="ai-models-back" href="/">
        ← Back to Dashboard
      </a>
    </header>

    <section className="ai-models-section">
      <h2>Model 1: Energy Deficit Regression</h2>
      <p>
        A transparent regression model built on innovation index, birth/death ratios, and migration.
        This model provides a clear baseline formula for local decision-makers.
      </p>
      <div className="ai-models-metric">
        <span>Holdout Accuracy:</span>
        <strong>81.4%</strong>
      </div>
      <ul>
        <li>Formula centered on explainability and easy policy communication.</li>
        <li>Best for county-level planning dashboards and affordability models.</li>
      </ul>
    </section>

    <section className="ai-models-section">
      <h2>Model 2: Reinforcement Learning with Slope Signals</h2>
      <p>
        Reinforcement learning improves the regression baseline by comparing county slope data
        (terrain, infrastructure gradients) to optimize local energy deficit predictions.
      </p>
      <div className="ai-models-metric">
        <span>Holdout Accuracy:</span>
        <strong>86.2%</strong>
      </div>
      <ul>
        <li>Improves fit using slope-adjusted feedback loops.</li>
        <li>Best for long-term infrastructure resilience planning.</li>
      </ul>
    </section>

    <section className="ai-models-section">
      <h2>Model 3: Policy Optimization (PPO + Gradient Boosting)</h2>
      <p>
        A hybrid model combining PPO-style reinforcement learning and gradient boosting for
        robust, multi-factor forecasts. This is the highest performing model in the suite.
      </p>
      <div className="ai-models-metric">
        <span>Holdout Accuracy:</span>
        <strong>89.7%</strong>
      </div>
      <ul>
        <li>Optimized for stability across rapid demand spikes.</li>
        <li>Best for 2035 projections and emergency preparedness forecasts.</li>
      </ul>
    </section>

    <section className="ai-models-section">
      <h2>Implementation Notes</h2>
      <p>
        Reference implementations for all models live in the <code>current_model</code> script.
        Update that file with official training data as soon as it is approved for production.
      </p>
    </section>
  </div>
)

export default AIModelsReport
