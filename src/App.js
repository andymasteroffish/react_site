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
  filter: "Featured",
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

    var socialIconSize = 30;
    var socialIconStyle = {"marginRight":"10px"}

    return (
      <div  className="App">
        <Grid fluid>
          <Row style={{height:"40px", lineHeight:"50px"}}>
            <Col xs={1}></Col>
            <Col xs={6} style={{textAlign:"left"}} >
              <h3 >Andy Wallace is a game designer and digital artist</h3>
            </Col>
            <Col xs={4} style={{textAlign:"right"}}>
              <a href="https://twitter.com/Andy_Makes"><img src={"/img/icons/twitter_resize.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://www.tumblr.com/blog/andymakesgames"><img src={"/img/icons/tumblr_resize.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://vimeo.com/andymakes"><img src={"/img/icons/vimeo_resize.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://github.com/andymasteroffish"><img src={"/img/icons/GitHub-Mark-64px_white.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://andymakes.itch.io/"><img src={"/img/icons/itch_resize.png"} width={socialIconSize*3.27} height={socialIconSize} style={socialIconStyle}></img></a>
            </Col>
            <Col xs={1}></Col>
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

  //the rollover css for this is in App.css

  render() {

    //i is just to give each one a unique key. it doesn't do anything
    let elems = allTags.map((item,i) => {
      //most clicks just chaneg the filter
      var clickFunc = this.props.changeFilter.bind(this, item)
      //but clicking "about" should call up that page
      if (item == "About"){
        clickFunc = this.props.chooseProject.bind(this, "about")
      } 
      return <NavItem key={i} onClick={clickFunc}>{item}</NavItem>
      
    })

return (
      <div>
        <Nav bsStyle="tabs" justified onSelect={this.handleSelect} style={{"fontSize":"16px"}}>
          {elems}
        </Nav>
      </div>
    );
/*
    return (
      <Navbar style={{backgroundImage:"none", "backgroundColor":"transparent", "borderColor":"transparent",  "boxShadow":"inset 0 1px 0 rgba(255,255,255,0), 0 1px 5px rgba(0,0,0,0)"}}>
        <Navbar.Header >
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
        <Nav>
        {elems}
        </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
    */
  }
}


class GridContainer extends Component {
  constructor() {
    super();
  }

  render() {

    console.log("----");


    let elems = Projects.map((v, i) => {
      if (_.indexOf(v.tags, this.props.filter) > -1) {
        return <GridItem key={i} chooseProject={this.props.chooseProject} project={v}/>  
      }
    })

    return (
    <div style={{"marginTop":"15px"}}>
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
      <Col xs={4} sm={3} md={2} style={{height:"230px"}}>
      <div onClick={this.props.chooseProject.bind(this, this.props.project.nick)} style={{"cursor":"pointer"}}>
        <img src={imgSrc} width="150" height="150"></img>
        <h3 style={{textAlign:"center", "marginTop":"5px", "fontSize":"18px"}}>{projectName}</h3>
      </div>
      </Col>
    )
  }
}

class ProjectContainer extends Component {
  constructor(){
    super();
  }

  createMarkup() {
    return {__html: this.props.project.description}
  }

  createVidMarkup(){
    return {__html: this.props.project.vid}
  }

  render() {

    var hasVid = this.props.project.hasOwnProperty('vid');
    console.log("I GOT IT "+hasVid);

    let imgNumButtons = this.props.project.pics.map((picName, i) => {
      var style = {display:"inline-block", "verticalAlign":"top", "marginRight":"10px", "cursor":"pointer"}

      var innerText = this.props.curImgNum == i ? <b>{i+1}</b> : i+1

      return(
        <p key={i} onClick={this.props.chooseImage.bind(this, i)} style={style}>{innerText}</p>
      )
      
    })

    var picSrc = "/img/"+this.props.project.nick+"/"+this.props.project.pics[this.props.curImgNum];

    //set standard pic div
    var picDiv = <div><img  src={picSrc}/></div>

    //check if we're on a vid
    if (this.props.project.pics[this.props.curImgNum] == "vid"){
      picDiv = <div dangerouslySetInnerHTML={this.createVidMarkup()}></div>
    }

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
                 <div style={{textAlign:"left"}}>
                   <div dangerouslySetInnerHTML={this.createMarkup()}>
                   </div>
                 </div>
              </Col>
              <Col xs={8} style={{textAlign:"left"}}>
                {picDiv}
                <div >
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
