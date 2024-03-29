import React from "react";
import "./Timeline.css";

import { Stage, Layer, Rect, Circle } from "react-konva";

import axes from "../axes";
import { Filter } from "../filter";
import {
  getAttributeDisplayNameAndUnits,
  getRecordAttribute,
  Attribute,
  Record,
} from "../getActivity";
import { clamp, fractionalMinuteToPaceString, sliceDuration } from "../helpers";

export default function Timeline({
  attribute,
  records,
  offsetIndex,
  viewedDuration,
  filter,
  shouldConvertRpmToSpm,
  verticalMin,
  verticalMax,
}: Props): React.ReactElement {
  const range = verticalMax - verticalMin;
  return (
    <div className="Timeline">
      <div className="TimelineLabel">
        {getAttributeDisplayNameAndUnits(attribute, shouldConvertRpmToSpm)}
        {(() => {
          const record = records[offsetIndex];
          if (record) {
            return (
              <span
                className={
                  "ActiveRecordValue ActiveRecordValue--" +
                  (() => {
                    if (filter.isAttributeIllegal(attribute, record)) {
                      return "illegal";
                    } else if (filter.isAnyAttributeIllegal(record)) {
                      return "illegalOther";
                    } else {
                      return "legal";
                    }
                  })()
                }
              >
                {" = " +
                  (attribute === Attribute.Pace
                    ? fractionalMinuteToPaceString(
                        getRecordAttribute(record, attribute)
                      )
                    : getRecordAttribute(record, attribute))}
              </span>
            );
          } else {
            return null;
          }
        })()}
      </div>
      <Stage width={window.innerWidth} height={timelineHeight()}>
        <Layer width={window.innerWidth} height={timelineHeight()}>
          <Rect
            fill="#eeea"
            width={window.innerWidth}
            height={timelineHeight()}
          />
          {sliceDuration(records.slice(offsetIndex), viewedDuration).map(
            (record, i) => {
              const deltaTime =
                record.timestamp.getTime() -
                records[offsetIndex].timestamp.getTime();
              return (
                <Circle
                  key={record.index}
                  fill={(() => {
                    if (filter.isAttributeIllegal(attribute, record)) {
                      return ILLEGAL_ATTRIBUTE_RECORD_DOT_FILL;
                    } else if (filter.isAnyAttributeIllegal(record)) {
                      return ILLEGAL_OTHER_ATTRIBUTE_RECORD_DOT_FILL;
                    } else {
                      return i === 0
                        ? ACTIVE_RECORD_DOT_FILL
                        : INACTIVE_RECORD_DOT_FILL;
                    }
                  })()}
                  x={
                    window.innerWidth * (deltaTime / viewedDuration) +
                    recordDotRadius()
                  }
                  y={clamp({
                    min: 0,
                    max: timelineHeight(),
                    value:
                      timelineHeight() -
                      timelineHeight() *
                        ((getRecordAttribute(record, attribute) - verticalMin) /
                          range),
                  })}
                  radius={recordDotRadius()}
                />
              );
            }
          )}
        </Layer>
      </Stage>
    </div>
  );
}

interface Props {
  attribute: Attribute;
  records: Record[];
  offsetIndex: number;
  viewedDuration: number;
  filter: Filter;
  shouldConvertRpmToSpm: boolean;
  verticalMin: number;
  verticalMax: number;
}

const ACTIVE_RECORD_DOT_FILL = "#3ce";
const INACTIVE_RECORD_DOT_FILL = "#08b";
const ILLEGAL_ATTRIBUTE_RECORD_DOT_FILL = "red";
const ILLEGAL_OTHER_ATTRIBUTE_RECORD_DOT_FILL = "orange";

function timelineHeight(): number {
  return 0.2 * axes.minor;
}

function recordDotRadius(): number {
  return 0.005 * axes.major;
}
