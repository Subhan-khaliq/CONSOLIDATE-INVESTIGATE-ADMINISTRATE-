import React, { useEffect } from "react";
import "./App.css";
import "./styles/sb-admin-2.min.css";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import Login from "./components/Account/Login";
import Admin from "./components/Admin/Admin";
import Register from "./components/Account/Register";
import {Route} from "react-router";
import {PrivateComponent} from "./common/components/PrivateComponent";
import {UseSessionProvider} from "react-session-hook";
import { useDispatch } from 'react-redux';
// no client-side cookie access for auth token (HttpOnly cookie)
import { me } from './store/actions/account.actions';

const App: React.FC = () => {
    return (
        <UseSessionProvider>
            <div className="App" id="wrapper">
                <Router>
                        <PrivateComponent>
                            <Admin />
                        </PrivateComponent>
                        {/* fetch current user if token exists */}
                        <Startup />
                    <Switch>
                        <Route exact path="/login">
                            <Login />
                        </Route>
                        <Route exact path={"/register"}>
                            <Register/>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </UseSessionProvider>
    );
};

        const Startup: React.FC = () => {
            const dispatch = useDispatch();
            useEffect(() => {
                // Attempt to fetch current session; server will respond based on cookie
                dispatch(me());
            }, [dispatch]);
            return null;
        }

export default App;
