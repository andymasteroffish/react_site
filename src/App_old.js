import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import _ from 'lodash'
import $ from 'jquery'
import queryString from 'querystring'
import {Grid, Col, Row, Navbar, Nav, NavItem} from 'react-bootstrap'
import createHistory from 'history/createBrowserHistory'
import Projects from '../public/projects.json';

let history = createHistory()
let location = history.location;

// possible site modes:
// grid, project

let defaultSettings = {
  mode: "grid",
  filter: "featured",
}

let allTags = Projects.map((v) => {
  return v.tags
});

allTags = _.uniq(_.flattenDeep(allTags))

let allProjectNicks = Projects.map((v) => {
  return v.nick
})

class App extends Component {
  constructor() {
    super();
    this.state = _.clone(defaultSettings);
  }

  componentDidMount() {
    if (window.location.hash) {
      const h = window.location.hash.replace("#", "");
      const index = _.indexOf(allTags, h);
      if (index > -1) {
        this.setState({
          filter: h
        })
      }
    } else {
      let qs = queryString.parse(location.search);
      console.log(qs)
      if (qs["?p"]) {
        const index = _.indexOf(allProjectNicks, qs["?p"]);
        if (index > -1) {
          this.setState({
            mode: "project"
          })
        }
      }
    }

  }

  changeFilter(filter) {
    this.setState({
      filter: filter,
      mode: "grid",
    })

    history.push({
      pathname: '/',
      hash: filter,
      search: ''
    })
  }

  chooseProject(nick) {  
    history.replace({
      hash: '',
      search: '?p=' + nick
    })
    this.setState({
      mode: "project",
    })
    window.location.reload();
  }

  render() {
    let elem;
    if (this.state.mode == "grid") {
      elem = <GridContainer chooseProject={this.chooseProject.bind(this)} filter={this.state.filter}/>
    } else if (this.state.mode == "project") {
      let qs = queryString.parse(location.search);
      let nick = qs["?p"]
      
      let proj = _.find(Projects, {'nick': nick});

      elem = <ProjectContainer project={proj}/>
    }

    return (
      <div className="App">
        <Grid fluid>
          <Row style={{height:"40px", lineHeight:"70px"}}>
            <Col xs={3}>
              <h3>Andy Wallace!</h3>
            </Col>
            <Col xs={3}>
              <a href="#">Github</a>
            </Col>
            <Col xs={3}>
              <a href="#">Github</a>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <FilterBar changeFilter={this.changeFilter.bind(this)}/>
            </Col>
          </Row>
          {elem}
        </Grid>
      </div>
    );
  }
}

class FilterBar extends Component {
  constructor() {
    super();
  }

  render() {

    let elems = allTags.map((v) => {
      return <NavItem onClick={this.props.changeFilter.bind(this, v)}>{v}</NavItem>
    })

    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
        <Nav>
        {elems}
        </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}


class GridContainer extends Component {
  constructor() {
    super();
  }

  render() {

    
    let elems = Projects.map((v, i) => {
      if (_.indexOf(v.tags, this.props.filter) > -1) {
        return <GridItem key={i} chooseProject={this.props.chooseProject} myProject={v}/>  
      }
    })

    return (
      <div>
        {elems}
      </div>
    )
  }
}

class GridItem extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <h1 onClick={this.props.chooseProject.bind(this, this.props.myProject.nick)}>{this.props.myProject.name}</h1>
      </div>
    )
  }
}

class ProjectContainer extends Component {
  render() {
    return (
      <div>{this.props.project.name}</div>
    )

  }

}


export default App;
