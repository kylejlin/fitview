import React from "react";
import "./App.css";

import EasyFit from "./easyFit";

import Option from "./Option";
import {
  getActivityRecords,
  capitalizeFirstLetter,
  dayOfWeekString,
  monthString,
  getTime,
  getActivityDuration
} from "./helpers";

export default class App extends React.Component<{}, AppState> {
  fileRef: React.RefObject<HTMLInputElement>;

  constructor(props: object) {
    super(props);

    this.state = { file: Option.none() };

    this.fileRef = React.createRef();

    this.handleUpload = this.handleUpload.bind(this);
  }

  render() {
    return (
      <div className="App">
        {this.state.file.match({
          none: () => (
            <label className="UploadButton">
              <input
                type="file"
                accept="fit"
                onChange={this.handleUpload}
                ref={this.fileRef}
                style={{ display: "none" }}
              />
              Upload .fit file
            </label>
          ),
          some: value => {
            console.log(value);

            const records = getActivityRecords(value.activity);
            const startDate = records[0].timestamp;
            const endDate = records[records.length - 1].timestamp;

            return (
              <div className="File">
                <div className="ActivityOverview">
                  <div className="Entry">
                    Sport:{" "}
                    <span className="Value">
                      {capitalizeFirstLetter(value.sport.sport)}
                    </span>
                  </div>
                  <div className="Entry">
                    Date:{" "}
                    <span className="Value">
                      {dayOfWeekString(startDate.getDay())}{" "}
                      {startDate.getDate()} {monthString(startDate.getMonth())}{" "}
                      {startDate.getFullYear()}
                    </span>
                  </div>
                  <div className="Entry">
                    Total duration:{" "}
                    <span className="Value">
                      {getActivityDuration(value.activity)}
                    </span>{" "}
                    Start time:{" "}
                    <span className="Value">{getTime(startDate)}</span> End
                    time: <span className="Value">{getTime(endDate)}</span>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  }

  handleUpload() {
    const { files } = this.fileRef.current!;
    if (files !== null && "object" === typeof files && files.length > 0) {
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
          }).parse(buffer, (error: any, data: any) => {
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

interface AppState {
  file: Option<any>;
}
