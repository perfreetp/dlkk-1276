import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { GoalProvider } from '@/store/GoalContext';
import './app.scss';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return (
    <GoalProvider>
      {props.children}
    </GoalProvider>
  );
}

export default App;
