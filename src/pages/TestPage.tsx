import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';
import { Knob } from 'primereact/knob';
import { useState } from 'react';

export const TestPage = () => {
  const [value, setValue] = useState(0);
  return (
    <div className='h-full w-full flex flex-column gap-3 align-items-center justify-content-center'>
      <h1 className='text-3xl font-bold'>Test Page</h1>
      <div className='flex flex-column gap-3'>
        <Knob
          value={value}
          onChange={e => setValue(e.value)}
          size={200}
          min={0}
          max={100}
          showValue
        />
        <ButtonGroup>
          <Button
            label='Increase'
            onClick={() => setValue(prev => Math.min(prev + 10, 100))}
          />
          <Button
            label='Decrease'
            onClick={() => setValue(prev => Math.max(prev - 10, 0))}
          />
        </ButtonGroup>
      </div>
    </div>
  );
};
