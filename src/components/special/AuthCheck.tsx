import { observer } from 'mobx-react-lite';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../features/hooks';
import { FullscreenLoading } from '../common/Loading/Loading';

export const Checker = observer(({
  children
}: { children: JSX.Element }) => {
  const { auth } = useStore();
  const { isAuth, isCheckingAuth } = auth;


  if (isAuth) return children;

  if (isCheckingAuth) return <FullscreenLoading />

  return (
    <Navigate
      replace
      to="/authorize"
    />
  );
})


