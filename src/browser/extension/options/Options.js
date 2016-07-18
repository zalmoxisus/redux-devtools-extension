import React from 'react';
import FilterGroup from './FilterGroup';
import AllowToRunGroup from './AllowToRunGroup';
import MiscellaneousGroup from './MiscellaneousGroup';

export default (props) => (
  <div>
    <FilterGroup {...props} />
    <AllowToRunGroup {...props} />
    <MiscellaneousGroup {...props} />
  </div>
);
