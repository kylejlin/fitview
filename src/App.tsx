import React from "react";
import "./App.css";

import RenderablePromise from "./RenderablePromise";

import { EasyFit } from "./lib";

import Option from "./Option";
import {
  getActivityRecords,
  capitalizeFirstLetter,
  dayOfWeekString,
  monthString,
  getTime,
  getActivityDuration,
  reverseGeocode,
  Address,
  Location
} from "./helpers";

export default class App extends React.Component<{}, AppState> {
  fileRef: React.RefObject<HTMLInputElement>;

  constructor(props: object) {
    super(props);

    this.state = { activity: Option.none() };

    this.fileRef = React.createRef();

    this.handleUpload = this.handleUpload.bind(this);
  }

  render() {
    return (
      <div className="App">
        {this.state.activity.match({
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
          some: ({
            startLocation,
            isStartLocationTruncated,
            endLocation,
            isEndLocationTruncated,
            file
          }) => {
            console.log(file);

            const records = getActivityRecords(file.activity);
            const startDate = records[0].timestamp;
            const endDate = records[records.length - 1].timestamp;

            return (
              <div className="File">
                <div className="ActivityOverview">
                  <div className="Entry">
                    Sport:{" "}
                    <span className="Value">
                      {capitalizeFirstLetter(file.sport.sport)}
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
                    Start location:{" "}
                    <span className="Value">
                      <RenderablePromise
                        promise={startLocation
                          .then(startLocation => (
                            <Location
                              isTruncated={isStartLocationTruncated}
                              location={startLocation}
                            />
                          ))
                          .catch(err => {
                            console.log("Error loading start location", err);
                            return "Error loading location";
                          })}
                        fallback="loading..."
                      />
                    </span>
                  </div>
                  <div className="Entry">
                    End location:{" "}
                    <span className="Value">
                      <RenderablePromise
                        promise={endLocation
                          .then(endLocation => (
                            <Location
                              isTruncated={isEndLocationTruncated}
                              location={endLocation}
                            />
                          ))
                          .catch(err => {
                            console.log("Error loading end location", err);
                            return "Error loading location";
                          })}
                        fallback="loading..."
                      />
                    </span>
                  </div>
                  <div className="Entry">
                    Total duration:{" "}
                    <span className="Value">
                      {getActivityDuration(file.activity)}
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
              const firstSession = data.activity.sessions[0];
              const records = getActivityRecords(data.activity);
              const endRecord = records[records.length - 1];

              this.setState({
                activity: Option.some({
                  startLocation: reverseGeocode(
                    firstSession.start_position_lat,
                    firstSession.start_position_long
                  ),
                  isStartLocationTruncated: true,
                  endLocation: reverseGeocode(
                    endRecord.position_lat,
                    endRecord.position_long
                  ),
                  isEndLocationTruncated: true,
                  file: data
                })
              });
            }
          });
        }
      });
      reader.readAsArrayBuffer(file);
    }
  }
}

interface AppState {
  activity: Option<Activity>;
}

interface Activity {
  startLocation: Promise<Address>;
  isStartLocationTruncated: boolean;
  endLocation: Promise<Address>;
  isEndLocationTruncated: boolean;
  file: any;
}
