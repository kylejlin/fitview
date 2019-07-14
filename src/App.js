import React from "react";
import "./App.css";

import EasyFit from "easy-fit";

import Option from "./Option";

class App extends React.Component {
  constructor() {
    super();

    this.state = { file: Option.none() };

    this.fileRef = React.createRef();

    this.handleUpload = this.handleUpload.bind(this);
  }

  render() {
    return (
      <div className="App">
        <input
          type="file"
          accept="fit"
          onChange={this.handleUpload}
          ref={this.fileRef}
        />

        {this.state.file.match({
          none: () => <p>No file uploaded</p>,
          some: value => (console.log(value), <p>File uploaded</p>)
        })}
      </div>
    );
  }

  handleUpload() {
    const { files } = this.fileRef.current;
    if ("object" === typeof files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        if (reader.error) {
          throw reader.error;
        } else {
          const buffer = reader.result;
          new EasyFit({
            force: true,
            speedUnit: "km/h",
            lengthUnit: "m",
            temperatureUnit: "kelvin",
            elapsedRecordField: true,
            mode: "cascade"
          }).parse(buffer, (error, data) => {
            if (error) {
              throw error;
            } else {
              this.setState({ file: Option.some(data) });
            }
          });
        }
      });
      reader.readAsArrayBuffer(file);
    }
  }
}

export default App;
