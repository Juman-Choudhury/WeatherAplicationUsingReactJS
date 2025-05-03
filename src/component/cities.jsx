import { FaSearch } from "react-icons/fa";

const Cities = ({ city, getCity}) => {
  return (
  
     <li onClick={()=>getCity(city)}><FaSearch className="search-icon--ul"/>{city}</li>

  );
};

export default Cities;
