import React from "react";
import "./App.css";

import ExpandButton from "./components/ExpandButton";
import Location from "./components/Location";

import { EasyFit } from "./lib";

import Option from "./Option";
import Qprom from "./Qprom";
import {
  getActivityRecords,
  capitalizeFirstLetter,
  dayOfWeekString,
  monthString,
  getTime,
  getActivityDuration,
  reverseGeocode,
  Address
} from "./helpers";

export default class App extends React.Component<{}, AppState> {
  fileRef: React.RefObject<HTMLInputElement>;

  constructor(props: object) {
    super(props);

    this.state = { activity: Option.none() };

    this.fileRef = React.createRef();

    this.forceUpdate = this.forceUpdate.bind(this);

    this.handleUpload = this.handleUpload.bind(this);
    this.toggleIsStartLocationTruncated = this.toggleIsStartLocationTruncated.bind(
      this
    );
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
                      {startLocation.match({
                        pending: () => "loading",
                        fulfilled: startLocation => (
                          <>
                            <ExpandButton
                              isExpanded={!isStartLocationTruncated}
                              onClick={this.toggleIsStartLocationTruncated}
                            />
                            <Location
                              isTruncated={isStartLocationTruncated}
                              location={startLocation}
                            />
                          </>
                        ),
                        rejected: err => {
                          console.log("Error loading start location", err);
                          return "Error loading location";
                        },
                        onUpdate: this.forceUpdate
                      })}
                    </span>
                  </div>
                  <div className="Entry">
                    End location:{" "}
                    <span className="Value">
                      {endLocation.match({
                        pending: () => "loading",
                        fulfilled: endLocation => (
                          <>
                            <ExpandButton
                              isExpanded={!isEndLocationTruncated}
                              onClick={this.toggleIsEndLocationTruncated}
                            />
                            <Location
                              isTruncated={isEndLocationTruncated}
                              location={endLocation}
                            />
                          </>
                        ),
                        rejected: err => {
                          console.log("Error loading start location", err);
                          return "Error loading location";
                        },
                        onUpdate: this.forceUpdate
                      })}
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

              this.setState(
                {
                  activity: Option.some({
                    startLocation: Qprom.fromPromise(
                      reverseGeocode(
                        firstSession.start_position_lat,
                        firstSession.start_position_long
                      )
                    ),
                    isStartLocationTruncated: true,
                    endLocation: Qprom.fromPromise(
                      reverseGeocode(
                        endRecord.position_lat,
                        endRecord.position_long
                      )
                    ),
                    isEndLocationTruncated: true,
                    file: data
                  })
                },
                () => {
                  console.log("done setting state");
                }
              );
            }
          });
        }
      });
      reader.readAsArrayBuffer(file);
    }
  }

  toggleIsStartLocationTruncated() {
    this.setState(state => ({
      activity: state.activity.map(activity => ({
        ...activity,
        isStartLocationTruncated: !activity.isStartLocationTruncated
      }))
    }));
  }

  toggleIsEndLocationTruncated() {
    this.setState(state => ({
      activity: state.activity.map(activity => ({
        ...activity,
        isEndLocationTruncated: !activity.isEndLocationTruncated
      }))
    }));
  }
}

interface AppState {
  activity: Option<Activity>;
}

interface Activity {
  startLocation: Qprom<Address>;
  isStartLocationTruncated: boolean;
  endLocation: Qprom<Address>;
  isEndLocationTruncated: boolean;
  file: any;
}
