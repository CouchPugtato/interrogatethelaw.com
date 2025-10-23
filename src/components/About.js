import React from 'react';

function About() {
  return (
    <div style={{ maxWidth: '900px', margin: '40px auto 0', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginTop: 0 }}>About</h1>
      <p>
        InterrogateTheLaw.com helps you explore legislative activity across the United States.
        Bill information is retrieved in real time, then displayed here with
        simple navigation so you can quickly scan and understand what matters.
      </p>
      <p>
        On bill pages, highlight any text to get an AI‑powered summary. 
        Choose an explaination level (Brief, Standard, In Depth) and the tool will summarize 
        the selected text to match.
      </p>
      <p>
        Bill data is provided by LegiScan.com under a Creative Commons Attribution 4.0 license.
      </p>
    </div>
  );
}

export default About;