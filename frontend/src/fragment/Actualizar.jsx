import {  useEffect } from 'react';
import { useNavigate } from 'react-router';


function Actualizar() {
  const navegation = useNavigate();
  useEffect(() => {
    navegation("/usuarios");
  }, []);
}
export default Actualizar;