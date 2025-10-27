let baseUrl;

if(import.meta.env.VITE_NODE_ENV === 'production'){
      baseUrl = "your-deployed-URL";
}
else{
    baseUrl = "http://localhost:4000";
}

export {baseUrl};