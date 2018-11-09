// @flow

import React from 'react';

const STYLE_COLOR = {
  color: '#c40df2',
};

const STYLE_BACKGROUND_COLOR = {
  backgroundColor: '#e8e87d',
};

const STYLE_MIXED = {
  ...STYLE_COLOR,
  ...STYLE_BACKGROUND_COLOR,
};

class DemoAppHTMLTemplate extends React.PureComponent<any, any, any> {
  render(): React.Element<any> {
    return (
      <div className="demo-app-template">
        <h1>H1 Header</h1>
        <table>
          <tbody>
            <tr><th colSpan="3" data-colwidth="100,0,0">Wide header</th></tr>
            <tr><td>One</td><td>Two</td><td>Three</td></tr>
            <tr><td>Four</td><td>Five</td><td>Six</td></tr>
          </tbody>
        </table>
        <h3>H3 Header</h3>
        <img
          alt="cat pix"
          height="200"
          src="https://placekitten.com/200/200"
          width="200"
        />
        <hr />
        <img
          alt="cat pix"
          height="100"
          src="https://placekitten.com/200/100"
          width="200"
        />
        <ol>
          <li>AAAAA</li>
          <li>BBB</li>
          <li>CCCCC</li>
          <li>DDDDDD</li>
        </ol>
        <h1>Editor Example</h1>
        <h2>H2 Header</h2>
        <p>
          Lorem ipsum dolor sit amet, phaedrum efficiantur pri cu, te quem
          <span style={STYLE_BACKGROUND_COLOR}>
            aliquando est. Viris aliquando definiebas duo et. Usu everti iriure
          </span>
          aliquando est. Viris aliquando definiebas duo et. Usu everti iriure
          <span style={STYLE_BACKGROUND_COLOR}>
            aliquando est. Viris aliquando definiebas duo et
            <span style={STYLE_COLOR}>
              aliquando est. Viris aliquando definiebas duo et. Usu everti iriure
            </span>
            sententiae est. Sit tamquam petentium an. Quo id p
            ersecuti dissentias, cu
          </span>
          aliquando est. Viris aliquando definiebas duo et. Usu everti iriure
          <span style={STYLE_MIXED}>

            With Background Color and Text Color
          </span>
        </p>
        <p>
          posidonium in. Te mea nonumes detracto legendos. Nulla essent causae
          et per, in cibo sententiae est. Sit tamquam petentium an. Quo id p
          ersecuti dissentias, cu sed diam prompta meliore, ne nominavi conv
          enire principes pro.
        </p>
        <ul start="10">
          <li>KKK</li>
          <li>GGG</li>
          <li>PPP</li>
          <li>QQQQQ</li>
        </ul>
        <ol start="10">
          <li>Item A</li>
          <li>Item B</li>
          <li>Item C</li>
          <li>Item D</li>
        </ol>
      </div>
    )
  }
}

export default DemoAppHTMLTemplate;
