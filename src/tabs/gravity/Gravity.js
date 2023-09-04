import { newInfo, postSNS, fixDate } from '../../extra/mini'

import { useState, useEffect } from 'react'

export default function Gravity({ gravityType, group }) {
  const [gravityName, setGravityName] = useState("")
  const [newUnit, setNewUnit] = useState("")
  const [allocatingUnits, setAllocatingUnits] = useState([])
  const [occupiedMembers, setOccupiedMembers] = useState([])
  const [leftMembers, setLeftMembers] = useState([])
  const [dragging, setDragging] = useState("")

  const [newOption, setNewOption] = useState("")
  const [options, setOptions] = useState([])

  const [purpose, setPurpose] = useState("")

  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let members = Object.keys(group.members).filter((m) => {
      for (let s in occupiedMembers) {
        if (occupiedMembers[s].includes(group.members[m].name)) {
          return false
        }
      }
      return true
    })
    setLeftMembers(
      members.map((m) => {
        const found = occupiedMembers.map((s) => {
          return s.includes(group.members[m].stagename)
        }).filter((v) => {
          return v
        }).length
        if (!found) {
          return group.members[m].stagename
        } else {
        }
      })
    )

    let requiredLength = allocatingUnits.length ? Math.ceil(Object.keys(group.members).length/allocatingUnits.length) : 0
    if (requiredLength > occupiedMembers.length) {
      setOccupiedMembers(
        occupiedMembers.concat(
          [...Array(requiredLength - occupiedMembers.length).keys()].map((s) => {
            return []
          })
        )
      )
    } else if (requiredLength < occupiedMembers.length) {
      setOccupiedMembers(occupiedMembers.slice(0, requiredLength))
    }

  }, [occupiedMembers, allocatingUnits, group])
  
  function gridStyle(number) {
    if (!number) {
      number = allocatingUnits.length
    }
    return {
      display: "grid", 
      gridAutoFlow: "row",
      gridTemplateColumns: "repeat(" + (number) + ", 1fr)",
      margin: 10
    }
  }

  function drop(e) {
    try {
      let s = ""
      for (let c in e.classList) {
        if (e.classList[c].startsWith("slot-")) {
          s = Number(e.classList[c].slice(5))
          break
        }
      }
      if (s === "") {
        throw Error()
      }
      let nOccupiedMembers = occupiedMembers
      if (nOccupiedMembers[s].length < allocatingUnits.length) {
        nOccupiedMembers[s].push(dragging)
      }
      setOccupiedMembers(nOccupiedMembers)
    } catch {
      try {
        if (!e.target) { 
          throw Error()
        }
        drop(e.target)
      } catch {
        try {
          drop(e.target.parentElement)
        } catch {
          try {
            drop(e.parentElement)
          } catch {}
        }
      }
    }
  }

  function configuration(gravityType) {
    switch (gravityType) {
      case "grand (batches)":
        return <div className="grand-gravity-batches">
          <div className="member-bank grand-gravity-batches-child" id="draggableOptions" style={gridStyle()}>
            {
              leftMembers.map((m) => {
                return <div draggable onDragStart={e => setDragging(m)}>{m}</div>
              })
            }
          </div>
          <div className="grand-gravity-batches-child" style={gridStyle(allocatingUnits.length + 1)}>
            {
              allocatingUnits.map((m) => {
                return <div>{m}</div>
              })
            }
            <div>
              <input name="newUnit" onChange={e => setNewUnit(e.target.value)}></input>
              <button onClick={(e) => {
                e.preventDefault()
                if (newUnit) {
                  setAllocatingUnits(allocatingUnits.concat([newUnit]))
                }
              }}>add unit</button>
            </div>
          </div>
          <div>
            {
              [...Array(occupiedMembers.length).keys()].map((s) => {
                return <div 
                  className={`member-slot slot-${s}`} 
                  style={gridStyle(allocatingUnits.length + 1)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => drop(e)}
                >
                  <div>round {s+1}:</div>
                  {
                    occupiedMembers[s].map((m) => {
                      return <div>{m}</div>
                    })
                  }
                </div>
              })
            }
          </div>
        </div>

      case "grand (pool)":
        return (
          <div className="grand-gravity-batches-child" style={gridStyle()}>
            {
              allocatingUnits.map((m) => {
                return <div>{m}</div>
              })
            }
            <div>
              <input name="newUnit" onChange={e => setNewUnit(e.target.value)}></input>
              <button onClick={(e) => {
                e.preventDefault()
                if (newUnit) {
                  setAllocatingUnits(allocatingUnits.concat([newUnit]))
                }
              }}>add unit</button>
            </div>
          </div>
        )

      default:
        const purposeMenu = (
          <select onChange={e => setPurpose(e.target.value)}>
            <option value="fandom name">fandom name</option>
          </select>
        )
        return (
          <div style={gridStyle(options.length > 4 ? 4 : options.length)}>
            {
              options.map((m) => {
                return <div>{m}</div>
              })
            }
            <div>
              <input name="newUnit" onChange={e => setNewOption(e.target.value)}></input>
              <button onClick={(e) => {
                e.preventDefault()
                if (newOption) {
                  setOptions(options.concat([newOption]))
                }
              }}>add song</button>
            </div>
          </div>
        )
    }
  }

  function submitGravity(gravityType) {
    let addGravity = {
      name: gravityName,
      number: Object.keys(group.gravities).length + 1, 
      units: {},
      type: gravityType,
      rounds: []
    }
    let count = 0
    let numberOfRounds = 0

    let info = [
      {
        type: "alert",
        message: `gravity with type ${gravityType} initiated.`,
        urgency: 0
      }
    ]
    let sns = ["twitter", "youtube"].map(s => {
      return {
	      type: "announcement",
	      platform: s,
	      text: `${group.name}: ${gravityName} ${gravityType.slice(0, 5) === "grand" ?  "preview" : `${gravityType.slice(-6) === "(pool)" ? purpose : ""} official announcement`}`
	    }
    })

    let data = JSON.parse(localStorage.getItem("data"))
    addGravity.date = data.profile.progress

    let members = {}
    for (let u in allocatingUnits) {
      members[allocatingUnits[u]] = []
    }
    addGravity.units = Object.assign({}, members)

    if (gravityType.slice(0, 5) === "grand") {
      info.push({
        type: "alert",
        message: `units ${allocatingUnits.slice(0, -1).join(", ")} and ${allocatingUnits.slice(-1)[0]} have been formed.`,
        urgency: 0,
        date: fixDate([...data.profile.progress.slice(0, 2), data.profile.progress[2] + 1])
      })
    }

    switch (gravityType) {
      case "grand (batches)":
        let rounds = occupiedMembers

        addGravity.rounds = rounds.map((r) => {
          while (r.length < allocatingUnits) {
            r.push(null)
          }
          let permutations = permutation(r).map((p) => {
            return [...Array(p).keys()].map((c) => {
              if (p[c] !== null) {
                members[allocatingUnits[c]].push(p[c])
                addGravity.units[allocatingUnits[c]].push(p[c])
                return [p[c], allocatingUnits[c]]
              } else {
                return ""
              }
            })
          })
          const winner = permutations[Math.floor(Math.random() * permutations.length)]
          count++
          return {
	          number: count,
	          options: permutations,
	          winner: winner
          }
        })

        break
       
      case "grand (pool)":
        let memberPool = Object.keys(group.members).map((m) => {return group.members[m].name})
        numberOfRounds = Math.ceil(memberPool.length / allocatingUnits.length)
        addGravity.rounds = Array(numberOfRounds).map(() => {
          while (memberPool.length < allocatingUnits) {
            memberPool.push(null)
          }
          let permutations = []
          for (let p in combination(memberPool, allocatingUnits.length)) {
            permutations = permutations.concat(permutation(p))
          }
          let choice = permutations[Math.floor(Math.random() * permutations.length)]
          choice = [...Array(choice).keys()].map((c) => {
            if (choice[c] !== null) {
              members[allocatingUnits[c]].push(choice[c])
              addGravity.units[allocatingUnits[c]].push(choice[c])
              return [choice[c], allocatingUnits[c]]
            } else {
              return ""
            }
          })
          count++
          return {
            number: count,
            options: permutations,
            winner: choice
          }
        })

        break

      case "event (brackets)":
        numberOfRounds = Math.ceil(Math.log(options.length)/Math.log(2))
        let before = options
        let matches = []
        let after = []
        let roundNames = ["preliminary round", "quarter-finals", "semi-finals", "finals"]
        let finalWinner = ""
        if (numberOfRounds > 4) {
          roundNames = [...Array(numberOfRounds - 3).keys()].map(m => {
            return "round " + (m + 1)
          }).concat(roundNames.slice(1))
        } else if (numberOfRounds < 4) {
          roundNames = roundNames.slice(-numberOfRounds)
        }

        for (let i = 0; i < numberOfRounds; i++) {
          const slots = 2 ** (numberOfRounds - 1) 
          after = []
          matches = Array(slots).map(() => {return []})
          for (let j = 0; j < after.length; j++) {
            matches[j % slots].append(options[j])
          }
          addGravity.rounds.concat(matches.map((m) => {
            count++
            const [winner, loser] = [[0, 1], [1, 0]][Math.floor(Math.random() * 2)]
            after.push(m[winner])
            if (i === numberOfRounds - 1) {
              finalWinner = m[winner]
            }
            sns = sns.concat(["twitter", "youtube"].map(s => {
              return {
                type: "announcement",
                platform: s,
                text: `${group.name}: ${gravityName} ${roundNames[i]} - match ${count}`
              }
            }))
            return {
              "id": addGravity.rounds.length + 1,
              "name": `${roundNames[i]} - match ${count}`,
              "nextMatchId": 0, // null if final
              "tournamentRoundText": roundNames[i], // Text for Round Header
              "state": "DONE",
              "participants": [
                {
                  "id": m[winner], // Unique identifier of any kind
                  "resultText": "won", // Any string works
                  "isWinner": true,
                  "status": null,
                  "name": m[winner]
                },
                {
                  "id": m[loser],
                  "resultText": "lost",
                  "isWinner": false,
                  "status": null,
                  "name": m[loser]
                }
              ]
            }
          }))
        }

        info.push({
          type: "alert",
          message: `${finalWinner} has won the ${gravityName}!`,
          urgency: 0,
          date: fixDate([...data.profile.progress.slice(0, 2), data.profile.progress[2] + 1])
        })

        for (let i in addGravity.rounds) {
          for (let j in addGravity.rounds) {
            if (j.participants.map((m) => {return m.id}).includes(i.participants[0].id) && roundNames.indexOf(j.tournamentRoundText) - 1 === roundNames.indexOf(i.tournamentRoundText)) {
              i.nextMatchId = j.id
            }
          }
        }

        setErrorMessage("you need a planned album first.")

        return

      case "event (pool)":
        const choice = options[Math.floor(Math.random() * options)]

        addGravity.rounds = [
          {
            number: 1,
            options: options,
            choice: choice
          }
        ]

        info.push({
          type: "alert",
          message: `${choice} has won the ${gravityName}!`,
          urgency: 0,
          date: fixDate([...data.profile.progress.slice(0, 2), data.profile.progress[2] + 1])
        })

        switch (purpose) {
          case "fandom name":
            data.assets.artists[group.name].fandom = choice
        }

        break
    }

    for (let u in allocatingUnits) {
      if (Object.keys(data.assets.artists[group.name].units).includes(allocatingUnits[u])) {
        setErrorMessage(`${allocatingUnits[u]} is already an existing unit.`)
        return
      } else {
        data.assets.artists[group.name].units[u] = {
	        "name": u,
	        "debut": [],
	        "members": members[u], // names only
	        "discography": [],
        }
      }
    }

    if (addGravity.rounds !== []) {
      data.assets.artists[group.name].gravities[gravityName] = addGravity
      data = newInfo(data, info)
      data = postSNS(data, group.name, sns)
      localStorage.setItem("data", JSON.stringify(data))
    }
  }

  let data = JSON.parse(localStorage.getItem("data"))

  return (
    <div>
      {configuration(gravityType)}
      gravity name: <input onChange={e => setGravityName(e.target.value)}></input>
      <h4 className="error-message">{errorMessage}</h4>
      <button onClick={(e) => {e.preventDefault(); submitGravity(gravityType)}}>start!</button>
      <div>
        {
          Object.values(data.assets.artists[group.name].gravities).map(g => {
            <PastGravity gravityData={g} />
          })
        }
      </div>
    </div>
  )
}

function PastGravity({ gravityData }) {
  switch (gravityData.type) {
    case "grand (batches)":
      let max = 0
      for (let u in Object.values(gravityData.values)) {
        max = u.length > max ? u.length : max
      }
      return (
        <div>
          {
            Object.keys(gravityData.units).map(u => {return <div>{u}</div>})
          }
          {
            [...Array(max).keys()].map(i => {
              Object.values(gravityData.values).map(u => {
                return <div>{u[i] ? u[i] : ""}</div>
              })
            })
          }
        </div>
      )
  }
}

function permutation(inputArr) {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
     }
   }
 }

 permute(inputArr)

 return result;
}

function combination(array, n) {
  let result = []

  if (n === 1) {
    for (const a of array) {
      result.push([a]);
    }
  } else {
    for (let i = 0; i <= array.length - n; i++) {
      for (const c of combination(array.slice(i + 1), n - 1)) {
        result.push([array[i], ...c])
      }
    }
  }

  return result
}
