import React from "react";
import "./App.css";

import EasyFit from "easy-fit";

import Option from "./Option";

export default class App extends React.Component {
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
          some: value => {
            console.log(value);

            const records = getActivityRecords(value.activity);
            const startDate = records[0].timestamp;
            const endDate = records[records.length - 1].timestamp;

            return (
              <div className="File">
                <div>Sport: {capitalizeFirstLetter(value.sport.sport)}</div>
                <div>
                  Date: {dayOfWeekString(startDate.getDay())}{" "}
                  {startDate.getDate()} {monthString(startDate.getMonth())}{" "}
                  {startDate.getFullYear()}
                </div>
                <div>Start time: {getTime(startDate)}</div>
                <div>End time: {getTime(endDate)}</div>
                <div>Total duration: {getActivityDuration(value.activity)}</div>
              </div>
            );
          }
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

function getActivityRecords(activity) {
  return activity.sessions.map(session => getSessionRecords(session)).flat();
}

function getSessionRecords(session) {
  return session.laps.map(lap => lap.records).flat();
}

function capitalizeFirstLetter(word) {
  return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
}

function dayOfWeekString(index) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ][index];
}

function monthString(index) {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ][index];
}

function getTime(date) {
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function getActivityDuration(activity) {
  const hours = Math.floor(activity.total_timer_time / 3600);
  const minutes = Math.floor((activity.total_timer_time % 3600) / 60);
  const seconds = Math.floor(activity.total_timer_time % 60);
  return (
    zeroPad(hours, 2) + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2)
  );
}

function zeroPad(value, minWidth) {
  const string = "" + value;
  if (string.length < minWidth) {
    const deficit = minWidth - string.length;
    return "0".repeat(deficit) + string;
  } else {
    return string;
  }
}
