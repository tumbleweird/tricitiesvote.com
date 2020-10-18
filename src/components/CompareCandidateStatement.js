import React, { useState } from 'react';
import _ from 'lodash';

const CompareCandidateStatement = props => {
  const { position, name, last, image, comment, spec, dnr, mini } = props;
  const id = _.uniqueId('candidate_');
  const cssId = `#${id}`;
  let posClass;
  if (spec && dnr) {
    posClass = `pos ${position} speculation dnr`;
  }
  if (spec && !dnr) {
    posClass = `pos ${position} speculation`;
  }
  if (!spec) {
    posClass = `pos ${position}`;
  }

  const handleClick = () => {
    console.log('cssId', cssId);
    const candidate =
      typeof document !== `undefined` ? document.querySelector(cssId) : null;
    candidate.classList.toggle('show');
  };

  return (
    <div className={posClass} id={id}>
      <img alt={name} src={image} onClick={handleClick} />
      {/* <img alt={name} src="/images/blank.png" /> */}
      <h5>{last}</h5>
      {!mini ? (
        <div className="more" onClick={handleClick}>
          <span className="close" />
          <p className="says" onClick={handleClick}>
            {comment}
          </p>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default CompareCandidateStatement;
