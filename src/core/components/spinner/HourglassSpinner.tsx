import './styles/hourglass-spinner.scss';

export type HourglassSpinnerProps = {
  size?: number | string;
};

const HourglassSpinner = ({ size = 2 }: HourglassSpinnerProps) => {
  const sizeRem = typeof size === 'number' ? `${size}rem` : size;
  return (
    <div
      className='hgs-container'
      style={{ '--hgs-uib-size': sizeRem } as React.CSSProperties}
    >
      <div className='hgs-half' />
      <div className='hgs-half' />
    </div>
  );
};

export default HourglassSpinner;
