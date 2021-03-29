import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import _ from 'lodash'
//import $ from 'jquery'
import queryString from 'querystring'
import {Grid, Col, Row, Nav, NavItem} from 'react-bootstrap'
import createHistory from 'history/createBrowserHistory'
import Projects from './projects.json';

let history = createHistory()
let location = history.location;

const plotter_extra_text = "<br><br>All of my plotter drawings were created with an AxiDraw V3 pen plotter using archival quality ink on ph-neutral paper.<br><br>You can purchase my original plotter drawings in my <a href='http://shop.andymakes.com'>shop</a>."

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
    //window.onpopstate = this.onBackButtonEvent
    this.fakeReload(window.location.hash, location.search)
    
    history.listen((location, action) => {
      console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`)
      console.log(`The last navigation action was ${action}`)
      this.fakeReload(location.hash, location.search)
    })    

  }

  fakeReload(hash, search) {
    console.log(hash, search)
    if (hash) {
      const h = hash.replace("#", "");
      const index = _.indexOf(allTags, h);
      if (index > -1) {
        this.setState({
          filter: h,
          mode: "grid",
        })
      }
    } else if (search) {
      let qs = queryString.parse(search);
      if (qs["?p"]) {
        const index = _.indexOf(allProjectNicks, qs["?p"]);
        if (index > -1) {
          this.setState({
            mode: "project"
          })
        }
      }
    } else {
      this.setState({
        filter: 'Featured',
        mode: "grid"
      })
    }
  }

  //this actually fires for forward as well as back
  // onBackButtonEvent (e) {
  //   console.log(window.location.hash)
  //   console.log("BACK")
  //   console.log(e);
  //   e.preventDefault()
  //   //window.location.reload()
  //   // debug('handling back button press')
    
  //   // this.transitionTo('chatrooms')
  // }

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
    history.push({
      hash: '',
      search: '?p=' + nick
    })
    this.setState({
      mode: "project",
      imgNum: 0,
    })
  }

  chooseImage(imgNum){
    this.setState({
      imgNum: imgNum,
    })
  }

  render() {
    let elem;
    if (this.state.mode === "grid") {
      elem = <GridContainer chooseProject={this.chooseProject.bind(this)} filter={this.state.filter}/>
    } 
    else if (this.state.mode === "project") {
      let qs = queryString.parse(history.location.search);
      let nick = qs["?p"]
      let proj = _.find(Projects, {'nick': nick});


      elem = <ProjectContainer project={proj} chooseImage={this.chooseImage.bind(this)} curImgNum={this.state.imgNum}/>
    }

    var socialIconSize = 30
    var socialIconStyle = {"marginRight":"10px"}

    return (
      <div  className="App">
        <Grid fluid>
          <Row style={{height:"40px", lineHeight:"50px"}}>
            
            <Col xs={6} style={{textAlign:"left"}} >
              <h3 style={{ "fontSize":"22px" }} >Andy Wallace makes games & digital art</h3>
            </Col>
            <Col xs={6} style={{textAlign:"right"}}>
              <a href="https://shop.andymakes.com"><img src={"/img/icons/shop.png"} width={50} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://twitter.com/Andy_Makes"><img src={"/img/icons/twitter_resize.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://andymakesgames.tumblr.com/"><img src={"/img/icons/tumblr_resize.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://vimeo.com/andymakes"><img src={"/img/icons/vimeo_resize.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://github.com/andymasteroffish"><img src={"/img/icons/GitHub-Mark-64px_white.png"} width={socialIconSize} height={socialIconSize} style={socialIconStyle}></img></a>
              <a href="https://andymakes.itch.io/"><img src={"/img/icons/itch_resize.png"} width={socialIconSize*3.27} height={socialIconSize} style={socialIconStyle}></img></a>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <FilterBar changeFilter={this.changeFilter.bind(this)} chooseProject={this.chooseProject.bind(this)} curFilter={this.state.filter}/>
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
      //most clicks just change the filter
      var clickFunc = this.props.changeFilter.bind(this, item)
      //but clicking "about" should call up that page
      if (item === "About"){
        clickFunc = this.props.chooseProject.bind(this, "about")
      } 
      var isSelected = item === this.props.curFilter;
      var thisStyle = isSelected ? {"fontWeight":"bold"} : {"fontWeight":"lighter"}; 
      //var thisStyle = isSelected ? {"background":"rgba(255,255,255,0.5)"} : {"color":"red"}; 
      return <NavItem key={i} style={thisStyle} onClick={clickFunc}>{item}</NavItem>
      
    })

    return (
      <div>
        <Nav bsStyle="tabs" onSelect={this.handleSelect} style={{"fontSize":"16px"}}>
          {elems}
        </Nav>
      </div>
    );
  }

  // gotocv = function(){
  //   console.log("do it")
  //   history.push("https://stackoverflow.com/questions/31079081/programmatically-navigate-using-react-router");
  // }
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
      <Col xs={6} sm={3} md={2} style={{height:"210px"}}>
      <div onClick={this.props.chooseProject.bind(this, this.props.project.nick)} style={{"cursor":"pointer"}}>
        <img src={imgSrc} width="150" height="150"></img>
        <h3 style={{textAlign:"center", "marginTop":"5px", "fontSize":"16px"}}>{projectName}</h3>
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
    let val = {__html: this.props.project.description}

    //if this is a plotter drawing, add a note about where to buy
    if (this.props.project.tags[0] === "Plotter"){
      val.__html += plotter_extra_text;
    }
    return val
  }

  createVidMarkup(){
    return {__html: this.props.project.vid}
  }

  render() {

    //var hasVid = this.props.project.hasOwnProperty('vid');

    let imgNumButtons = this.props.project.pics.map((picName, i) => {
      var style = {display:"inline-block", "verticalAlign":"top", "marginRight":"10px", "cursor":"pointer"}

      var innerText = this.props.curImgNum == i ? <b>{i+1}</b> : i+1

      return(
        <p key={i} onClick={this.props.chooseImage.bind(this, i)} style={style}>{innerText}</p>
      )
      
    })

    var picSrc = "/img/"+this.props.project.nick+"/"+this.props.project.pics[this.props.curImgNum];
    var imgHeight = 500;  //default max height. a different one can be specified in the project
    //set standard pic div
    if (this.props.project.hasOwnProperty('max_height')){
      //console.log("got that max height");
      imgHeight = this.props.project.max_height;
      //console.log(imgHeight)
    }
    //plotter drawings can be a bit bigger
    if (this.props.project.tags[0] == "Plotter"){
      imgHeight = 600;
      console.log("now pls")
    }
    //var picDiv = <div><img style={{maxWidth: "100%", maxHeight: "100%", height:"auto", width:"auto"}} src={picSrc} height={imgHeight}/></div>
    var picDiv = <div><img style={{maxWidth: "100%", maxHeight: "100%", width:"auto"}} src={picSrc} height={imgHeight}/></div>

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
                 <h2 style={{textAlign:"left", "fontSize":"20px", "fontWeight":"bold"}}>{this.props.project.name} - {this.props.project.year}</h2>
              </Col>
           </Row>
           {/*hello*/}
           <Row >
              <Col xs={12} sm={4}>
                 <div style={{textAlign:"left" , "fontSize":"14px"}}>
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
