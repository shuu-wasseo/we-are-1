import { buyUpgrade, format } from "../../extra/mini.js"
import { upgradeLines } from "../../extra/lines.js"

function Upgrade({ type, num }) {
  const data = JSON.parse(localStorage.getItem("data")) 
  let price = 0
  switch (type) {
    case "trainees":
      price = 25 ** (num + 1) * 1000
      break
    case "hiring":
      price = 25 ** 3
  }
  const affordable = data.resources.money >= price
  return (
    <button 
      className={`medium`} 
      onClick={() => {if (affordable) buyUpgrade(type, num)}}
    >
      <h4 className={`s${num} noborder transparent lower`}>{upgradeLines[type][num]}</h4>
      <h5 className={`s${num} noborder transparent lower`}>{format(price)}</h5>
    </button>
  )
}

export default Upgrade
