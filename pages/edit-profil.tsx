// // pages/profile-edit.tsx

// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { useUser } from "@/services/sidebar/sidebar";

// const ProfileEdit = () => {
//   const { user, error } = useUser();
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (user) {
//       setName(user.name);
//       setEmail(user.email);
//     }
//   }, 