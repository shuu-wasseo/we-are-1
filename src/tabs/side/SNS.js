import { datify, format } from "../../extra/mini"

export default function SNS({ data }) {
  let stats = ["likes", "comments", "views", "reposts", "bookmarks", "quotes"]
  const types = {
    "instagram": 2,
    "youtube": 3,
    "tiktok": 5,
    "twitter": 6
  }

  const postStats = stats.slice(0, types[data.platform])

  return (
    <div className={`${data.platform} sns`}>
      <h6>{data.userid} on {data.platform} at {datify(data.date)}</h6>
      <h5>{data.text}</h5>
      {data.image ? <img src={data.image} /> : ""}
      <div className="sns-stats">
      {
        postStats.map((s) => {
          return <h6 className="sns-stat">{format(data.stats[s])} {s}</h6>
        })
      }
      </div>
    </div>
  )
}
