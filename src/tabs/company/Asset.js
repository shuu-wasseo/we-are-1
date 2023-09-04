import { getScore, getGrade } from "../../extra/mini"

export default function Asset({ type, data, data2, number }) {
  let score = 0
  switch (type) {
    case "trainee":
      score = getScore(data)
      return (
        <div className="asset-grid trainee-grid">
          <h4>{data.name}</h4>
          <h4>{data.gender}</h4>
          <h4>{score} ({getGrade(score)})</h4>
        </div>
      )
    case "member": 
      score = getScore(data)
      return (
        <div className="asset-grid employee-grid">
          <h4>{number}</h4>
          <h4 style={{color: data.color}}>{data.color}</h4>
          <h4>{data.stagename}</h4>
          <h4>{data.gender}</h4>
          <h4>{score} ({getGrade(score)})</h4>
        </div>
      )
    case "others":
      return (
        <div className="asset-grid employee-grid">
          <h4>{data.name}</h4>
          <h4>{data.gender}</h4>
          <h4>{data.position}</h4>
          <h4>{data.score} ({getGrade(data.score)})</h4>
          <h4>{data.contract} ₩ / trainee / month</h4>
        </div>
      )
  }
}
