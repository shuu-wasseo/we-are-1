import { format, datify, renderSNS, MainTab, renderInfo, incrementDate, getTabs, getSubTabs } from './extra/mini'
import { reset } from './extra/save'
import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react"

function App() {
  reset()
  
  const [data, setData] = useState(JSON.parse(localStorage.getItem("data")))
  const [date, setDate] = useState(data.profile.progress)
  const [money, setMoney] = useState(data.resources.money)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setData(JSON.parse(localStorage.getItem("data")))
      setDate(data.profile.progress)
      setMoney(data.resources.money)
    }, 50);
    return () => clearInterval(intervalId)
  }, [data.profile.progress]);

  const [tab, setTab] = useState(0)
  const [subtab, setSubTab] = useState(0)

  const tabs = getTabs()
  const subTabs = getSubTabs(tab)

  function changeTab(i) {
    setTab(i)
    setSubTab(0)
  }

  function changeSubTab(i) {
    setSubTab(i)
  }

  return (
    <div className="App">

      <div className="top">
        <div className="left corner">
          <h4>{format(money)} ₩</h4> 
        </div>

        <div className="right corner">
          <h4>{datify(date)}</h4>
          <button id="next-button" onClick={incrementDate}>
            <h4>next</h4>
          </button>
        </div>

        <h2 className="top">we are 1</h2>
        <h3>and also 24</h3>
      </div>

      <div className="tabs"> {
        [...Array(tabs.length).keys()].map((i) => {
          return <button 
            className={`tab s${i + 1} ${!i ? "invert current" : ""}`} 
            onClick={() => changeTab(i)}
          >
            {tabs[i]}
          </button>
        })
      } </div>

      <div className="subtabs"> {
        [...Array(subTabs.length).keys()].map((i) => {
          return <button 
            className={`subtab s${i + 1} ${!i ? "invert current" : ""}`} 
            onClick={() => changeSubTab(i)}
          >
            {subTabs[i]}
          </button>
        })
      } </div>

      <div className="left side-panel">
        {renderSNS()}
      </div>
      <div className="main-tab">
        <MainTab tab={tab} subtab={subtab} /> 
      </div>
      <div className="right side-panel">
        {renderInfo()}
      </div>

    </div>
  );
}

export default App;
