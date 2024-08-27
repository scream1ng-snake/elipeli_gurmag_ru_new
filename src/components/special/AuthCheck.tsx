import { observer } from 'mobx-react-lite';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../features/hooks';

export function CheckingAuth() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h3>...Loading</h3>
    </div>
  );
}

export const Checker = observer(({
  children
}: { children: JSX.Element }) => {
  const { auth } = useStore();
  const { isAuth, isCheckingAuth } = auth;


  if (isAuth) return children;

  if (isCheckingAuth) return <CheckingAuth />;

  return (
    <Navigate
      replace
      to="/authorize"
    />
  );
})


