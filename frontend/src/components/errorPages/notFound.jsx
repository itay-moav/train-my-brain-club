import { useNavigate } from "react-router-dom";
export default function NotFound(){
    const navigate = useNavigate();
    return (
        <h3 className="flex-auto text-red-700 ml-auto">The page you are looking for has been lost. 
        <button onClick={()=>navigate("/")}
                className="text-blue-500 hover:underline focus:outline-none">
            Get back to civilization!
        </button> 
        </h3>);
}