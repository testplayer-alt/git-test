import {
    signInWithEmailAndPassword,
    User,
    UserCredential,
} from "firebase/auth";
import React from "react";
import { getAuth } from "firebase/auth";

const App = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, "test_mail@gmail.com", "testuser").then(
        (credential: UserCredential) => {
            const user: User = credential.user;
            if (user) {
                console.log("アプリにログインしました");
            }
        }
    );
    return <div className="App">App</div>;
};

export default App;

