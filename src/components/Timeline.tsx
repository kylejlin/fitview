import React from "react";
import "./Timeline.css";

import { Stage, Layer, Rect, Circle } from "react-konva";

import roundTo from "round-to";

import axes from "../axes";
import { Filter } from "../filter";
import {
  getAttributeDisplayName,
  getRecordAttribute,
  Attribute,
  Record
} from "../getActivity";

export default function Timeline({
  attribute,
  records,
  offsetIndex,
  width,
  filter
}: Props): React.ReactElement {
  return (
    <div className="Timeline">
      <div className="TimelineLabel">
        {getAttributeDisplayName(attribute)}
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
                {" = " + roundTo(getRecordAttribute(record, attribute), 3)}
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
          {records.slice(offsetIndex, offsetIndex + width).map((record, i) => (
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
              x={window.innerWidth * (i / width) + recordDotRadius()}
              y={
                timelineHeight() -
                timelineHeight() * (getRecordAttribute(record, attribute) / 200)
              }
              radius={recordDotRadius()}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

interface Props {
  attribute: Attribute;
  records: Record[];
  offsetIndex: number;
  width: number;
  filter: Filter;
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
