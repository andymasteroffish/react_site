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
  imgNum: 0,
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
      //console.log(qs)
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
      imgNum: 0,
    })
    window.location.reload();
  }

  chooseImage(imgNum){
    this.setState({
      imgNum: imgNum,
    })
  }

  render() {
    let elem;
    if (this.state.mode == "grid") {
      elem = <GridContainer chooseProject={this.chooseProject.bind(this)} filter={this.state.filter}/>
    } 
    else if (this.state.mode == "project") {
      let qs = queryString.parse(location.search);
      let nick = qs["?p"]
      
      let proj = _.find(Projects, {'nick': nick});

      elem = <ProjectContainer project={proj} chooseImage={this.chooseImage.bind(this)} curImgNum={this.state.imgNum}/>
    }

    var iconSize = 30;
    var iconStyle = {"marginRight":"10px"}

    return (
      <div  className="App">
        <Grid fluid>
          <Row style={{height:"40px", lineHeight:"70px"}}>
            <Col xs={4}>
              <h3>Andy Wallace!</h3>
            </Col>
            <Col xs={8} style={{textAlign:"left"}}>
              <a href="https://twitter.com/Andy_Makes"><img src={"/img/icons/twitter_resize.png"} width={iconSize} height={iconSize} style={iconStyle}></img></a>
              <a href="https://www.tumblr.com/blog/andymakesgames"><img src={"/img/icons/tumblr_resize.png"} width={iconSize} height={iconSize} style={iconStyle}></img></a>
              <a href="https://vimeo.com/andymakes"><img src={"/img/icons/vimeo_resize.png"} width={iconSize} height={iconSize} style={iconStyle}></img></a>
              <a href="https://github.com/andymasteroffish"><img src={"/img/icons/GitHub-Mark-64px.png"} width={iconSize} height={iconSize} style={iconStyle}></img></a>
              <a href="https://andymakes.itch.io/"><img src={"/img/icons/itch_resize.png"} width={iconSize*3.27} height={iconSize} style={iconStyle}></img></a>
            </Col>
            
          </Row>
          <Row>
            <Col xs={12}>
              <FilterBar changeFilter={this.changeFilter.bind(this)} chooseProject={this.chooseProject.bind(this)}/>
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

    //i is just to give each one a unique key. it doesn't do anything
    let elems = allTags.map((item,i) => {
      //most clicks just chaneg the filter
      var clickFunc = this.props.changeFilter.bind(this, item)
      //but clicking "about" should call up that page
      if (item == "about"){
        console.log("steam "+i)
        clickFunc = this.props.chooseProject.bind(this, "about")
      } 
      return <NavItem key={i} onClick={clickFunc}>{item}</NavItem>
      
    })

    return (
      <Navbar >
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
        return <GridItem key={i} chooseProject={this.props.chooseProject} project={v}/>  
      }
    })

    return (
    <div>
        <Grid fluid>
          {elems}
        </Grid>
      </div>
    )
  }
}

class GridItem extends Component {
  constructor() {
    super();
  }

  render() {

    var projectName = this.props.project.name
    var imgSrc = "/img/"+this.props.project.nick+"/icon.png";

    return (
      <Col xs={6} sm={4} md={3}>
      <div onClick={this.props.chooseProject.bind(this, this.props.project.nick)}>
        <img src={imgSrc} width="200" height="200"></img>
        <h3 style={{textAlign:"center"}}>{projectName}</h3>
      </div>
      </Col>
    )
  }
}

class ProjectContainer extends Component {
  constructor(){
    super();
  }

  render() {

    let imgNumButtons = this.props.project.pics.map((picName, i) => {
      var style = {display:"inline-block", "verticalAlign":"top", "marginRight":"10px"}
      return(
        <p key={i} onClick={this.props.chooseImage.bind(this, i)} style={style}>{i+1}</p>
      )
      
    })

    var picSrc = "/img/"+this.props.project.nick+"/"+this.props.project.pics[this.props.curImgNum];
    //console.log("should draw "+ picSrc);
    return (

      <div>
        <Grid fluid>
           <Row style={{height:"40px", lineHeight:"70px"}}>
              <Col xs={12}>
                 <h2 style={{textAlign:"left"}}>{this.props.project.name} - {this.props.project.year}</h2>
              </Col>
           </Row>
           {/*hello*/}
           <Row >
              <Col xs={4}>
                 <div style={{textAlign:"left"}}>{this.props.project.description}</div>
              </Col>
              <Col xs={8}>
                <img src={picSrc}/>
                <div style={{textAlign:"left"}}>
                {imgNumButtons}
                </div>
              </Col>
           </Row>
        </Grid>
      </div> 
    )
  }
}



export default App;
