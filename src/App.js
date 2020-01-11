import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import dateFormat from 'dateformat';
import './bootstrap.min.css';
import './App.css';

class App extends Component {

  state = {
    iconState: true,
    sideState: true
  };

  toggleSidenav() {
    this.setState({
      iconState: !this.state.iconState,
      sideState: !this.state.sideState
    });
  }

  render() {
    return (
      <Router>
        <div>

          <div className={this.state.sideState ? "side" : "side active"}>
            <ul>
              <li>
                <Link to="/" onClick={this.toggleSidenav.bind(this)}>Matches</Link>
              </li>
              <li>
                <Link to="/standings" onClick={this.toggleSidenav.bind(this)}>Standings</Link>
              </li>
            </ul>
          </div>

          <div className="header sticky-top navbar">
            <div className="menu float-right">
              <Link className="p-2" to="/">Matches</Link>
              <Link className="p-2" to="/standings">Standings</Link>
            </div>

            <div className={this.state.iconState ? "icon" : "icon active float-right"} onClick={this.toggleSidenav.bind(this)}>
              <div className="line1"></div>
              <div className="line2"></div>
              <div className="line3"></div>
            </div>

          </div>


          <div className="wrapper">
            <Switch>
              <Route exact path="/" component={Matches} />
              <Route path="/standings" component={Standings} />
              <Route component={NoMatch} />
            </Switch>
          </div>

        </div>
      </Router>
    );
  }
}

export default App;

// Matches

class Matches extends Component {

  state = {
    matches: [],
    contentState: true,
    loaderState: true
  };

  getMatches = async () => {
    let matches = await fetch('https://api.football-data.org/v2/competitions/2021/matches', {
      headers: {
        'X-Auth-Token': 'api key'
      }
    });

    let matchesData = await matches.json();
    await this.showPage();
    this.setState({
      matches: matchesData.matches,
    });
    this.scrollTo();
  }

  showPage() {
    this.setState({
      loaderState: !this.state.loaderState,
      contentState: !this.state.contentState
    });
  }

  scrollTo() {
    let live = document.getElementById("IN_PLAY");
    let scheduled = document.getElementById("SCHEDULED");
    if (live) {
      live.scrollIntoView({ behavior: 'instant' });
    } else if (scheduled) {
      scheduled.scrollIntoView({ behavior: 'instant' });
    } else {
      return;
    }
  }

  componentDidMount() {
    this.getMatches();
  }

  render() {
    var matches = this.state.matches;
    dateFormat.masks.gameTime = 'd mmmm - hh:MM';
    return (
      <div className="matches container">
        <div className={this.state.loaderState ? "loader" : "hide"}></div>
        <div className={this.state.contentState ? "hide" : "show"}>
          {matches.map(function (match, index) {
            return (

              <div className="match" key={match.id} id={match.status}>

                <div className="row details">
                  <div className="col text-left">{dateFormat(match.utcDate, "gameTime")}</div>
                  <div className="col text-right">
                    {(() => {
                      switch (match.status) {
                        case "FINISHED": return "Finished";
                        case "SCHEDULED": return "Scheduled";
                        case "LIVE": return "Live";
                        case "IN_PLAY": return "Live";
                        case "PAUSED": return "Live";
                        case "POSTPONED": return "Postponed";
                        case "SUSPENDED": return "Suspended";
                        case "CANCELED": return "Canceled";
                        default: return "Scheduled";
                      }
                    })()}
                  </div>
                </div>

                <div className="row padding20">
                  <div className="col text-left">{
                    match.homeTeam.name.includes('FC') ? match.homeTeam.name.replace("FC", "") : match.homeTeam.name
                  }</div>
                  <div className="col text-right">{
                    match.awayTeam.name.includes('FC') ? match.awayTeam.name.replace("FC", "") : match.awayTeam.name
                  }</div>
                </div>

                <div className="row">

                  <div className="col-5"> <img src={require(`./logo/${match.homeTeam.id}.png`)} className="img-fluid" alt="" /></div>
                  <div className="col-2 score">
                    {match.score.fullTime.homeTeam}&nbsp;:&nbsp;{match.score.fullTime.awayTeam}
                  </div>
                  <div className="col-5"><img src={require(`./logo/${match.awayTeam.id}.png`)} className="img-fluid" alt="" /></div>

                </div>

              </div>

            );
          })}
        </div>
      </div>
    );
  }
}

// Standings

class Standings extends Component {

  state = {
    standings: [],
    tableState: true,
    loaderState: true
  };

  getStandings = async () => {
    let standings = await fetch('https://api.football-data.org/v2/competitions/2021/standings', {
      headers: {
        'X-Auth-Token': 'api key'
      }
    });

    let standingsData = await standings.json();
    await this.showPage();
    this.setState({
      standings: standingsData.standings[0].table
    });
  }

  showPage() {
    this.setState({
      loaderState: !this.state.loaderState,
      tableState: !this.state.tableState
    });
  }

  componentDidMount() {
    this.getStandings();
  }


  render() {
    var standings = this.state.standings;
    return (
      <div>
        <div className={this.state.loaderState ? "loader" : "hide"}></div>
        <div className={this.state.tableState ? "hide" : "show"}>
          <div className="table">
            <table>
              <thead>
                <tr className="th_border_bottom">
                  <th>Team</th>
                  <th>MP</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map(function (stand) {
                  return (
                    <tr className="border_bottom" key={stand.position}>
                      <td><img className="tableLogo" src={require(`./logo/${stand.team.id}.png`)} width="20" height="20" alt="" />&nbsp;{stand.team.name}</td>
                      <td>{stand.playedGames}</td>
                      <td>{stand.won}</td>
                      <td>{stand.draw}</td>
                      <td>{stand.lost}</td>
                      <td>{stand.points}</td>
                    </tr>
                  )
                })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

// NoMatch

class NoMatch extends Component {
  render() {
    return (
      <div className="text-center notfound">
        <h1 className="display-4">404</h1>
        <p>Page not found</p>
      </div>
    );
  }
}
