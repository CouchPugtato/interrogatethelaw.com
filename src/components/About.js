import React from 'react';
import "./About.css";

function About() {
  return (
    <div className="about-container">
  <h1>About</h1>
  <p>
    InterrogateTheLaw.com helps you explore legislative activity across the United States.
    Bill information is retrieved in real time, then displayed here with
    simple navigation so you can quickly scan and understand what matters.
  </p>
  <p>
    On bill pages, highlight any text to get an AI‑powered summary. 
    Choose an explanation level (Brief, Standard, In Depth) and the tool will summarize 
    the selected text to match.
  </p>
  <p>
    Bill data is provided by LegiScan.com under a Creative Commons Attribution 4.0 license.
  </p>
</div>
  );
}

export default About;