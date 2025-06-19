import './styles/hourglassSpinner.scss';

import { type CSSProperties } from 'react';

const HourglassSpinner = ({ style }: { style?: CSSProperties }) => {
  return (
    <div style={style}>
      <div className='hgs-container'>
        <div className='hgs-half' />
        <div className='hgs-half' />
      </div>
    </div>
  );
};

export default HourglassSpinner;
