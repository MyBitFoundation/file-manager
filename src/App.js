import React, { Component } from 'react';
import './App.scss';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { Route, Switch, Link } from 'react-router-dom';
import byteSize from './utils/index.js';
import {default as LoadingAnimation} from './images/loading-bubbles.js';
import { Credentials } from './constants';
const imageExtensions = require('image-extensions');
class FileExplorer extends Component {
  constructor(props){
    super(props);
    this.pullFolderContents = this.pullFolderContents.bind(this);
    this.state = {
      paths: [],
    }
    this.oldPath = "/";
    this.loading = true;
  }

  componentDidMount(){
    this.pullFolderContents();
  }

  shouldComponentUpdate(props, nextProps){
    if(this.oldPath !== props.location.pathname){
      this.pullFolderContents();
    }
    return true;
  }

  getPrettyByteSize(bytes){
    let prettyBytes = byteSize(bytes, {precision: 0});
    if(prettyBytes.unit === ""){
      prettyBytes.unit = "B";
    }
    return `${prettyBytes.value} ${prettyBytes.unit}`;
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if(acceptedFiles.length > 0){
      this.handleUploadImage(acceptedFiles);
    }
  }

  async handleUploadImage(files) {
    const config = {
      onUploadProgress: function(progressEvent) {
        var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total )
      }
    }

    await Promise.all(files.map(file => {
      this.setState({ uploadStatus: false });
      const data = new FormData();
      data.append('file', file);
      data.append('path', window.location.pathname)

      axios.post('/upload', data, config)
        .then((response) => {
          this.pullFolderContents();
        })
        .catch(function (error) {
          console.log(data)
          console.log(error);
        });
      }))
  }

  pullFolderContents(){
    this.loading = true;

    axios.get('/api', {
      params: {
        path: window.location.pathname
      },
      auth: {
        username: Credentials.username,
        password: Credentials.password,
      }
    }).then((response) => {
        this.oldPath = window.location.pathname;
        if(response.data){
          this.loading = false;
          document.title = `Files within app${window.location.pathname}`;
          this.setState({paths: response.data.children})
        }
        else{
          this.loading = false;
          this.setState({paths: undefined})
        }
      })
      .catch((err) => {
        console.log(err)
        this.loading = false;
        this.setState({paths: undefined})
      });
  }

  getCorrectUrl(newPath){
    let currentPath = this.props.location.pathname;
    if(currentPath === "/"){
      currentPath = "";
    }
    return currentPath + newPath + "/";
  }

  getFileType(file){
    if(imageExtensions.includes(file.extension.substring(1))){
      return 'picture';
    }

    return 'document';
  }

  getPreviousPath(){
    const currentPath = this.props.location.pathname;
    let split = currentPath.split('/');
    let pathToReturn = "";
    for(let i = 0; i < split.length - 2; i++){
      if(split[i] === ""){
        pathToReturn += "/";
      }
      else{
        pathToReturn += split[i];
      }
    }
    if(pathToReturn[pathToReturn.length - 1] !== "/"){
      return pathToReturn + "/";
    }

    return pathToReturn;
  }

  render(){
    const { location } = this.props;
    let paths = this.state.paths;
    let separator = location.pathname[location.pathname.length - 1] === "/" ? "" : "/";
    const path = "app" + location.pathname;
    let toRender = [];
    let directorySize = 0;

    let pathsTmp = paths.slice();
    //order - folders first
    if(pathsTmp){
      pathsTmp = pathsTmp.sort((a, b) => {
        return b.type < a.type;
      });
    }

    if(location.pathname !== "/"){
      pathsTmp.splice(0, 0, {
        type: 'directory',
        name: "previous",
        customName: "...",
        customPath: this.getPreviousPath(),
        size: 0,
      });
    }

    if(this.loading){
        toRender.push(
          <div className="FileExplorer__loadingAnimation">
            <LoadingAnimation/>
          </div>
        );
      }
      else if(!pathsTmp){
        toRender.push(<p className="FileExplorer__no-exists">This location does not exist</p>);
      }
      else{
        toRender.push(
          <div>
            <ul className="FileExplorer__files">
              {pathsTmp.map(path => {
                //hide hidden files
                directorySize += path.size;
                if(path.name.length > 0 && path.name[0] === '.'){
                  return null;
                }
                const isFile = path.type === 'file';
                const fileType = isFile ? this.getFileType(path) : "";
                if(isFile){
                  return (
                    <li key={path.name}>
                      <a
                        className={`FileExplorer__files--is-${fileType}`}
                        href={`${this.props.location.pathname}${separator}${path.name}`}
                      >
                        {path.name}
                        <span>{this.getPrettyByteSize(path.size)}</span>
                      </a>
                    </li>
                  )
                }else{
                  return (
                    <li key={path.name}>
                      <Link
                        className="FileExplorer__files--is-folder"
                        to={path.customPath ? path.customPath : this.getCorrectUrl(path.name)}
                        onClick={() => this.oldPath = this.props.location.pathname}
                      >
                        {path.customName ? path.customName : path.name + "/"}
                        <span>{path.customName ? "" : this.getPrettyByteSize(path.size)}</span>
                      </Link>
                    </li>
                  )
                }
              })}
            </ul>
            <Dropzone className="FileExplorer__dropzone" onDrop={(files) => this.onDrop(files)}>
              <div>Drop your files here or click to select them.</div>
            </Dropzone>
          </div>
        )
      }

      return(
        <div className="FileExplorer">
          <span className="FileExplorer__navigating-header">Navigating <b>{path}</b> <span>{this.getPrettyByteSize(directorySize)}</span></span>
          {toRender}
        </div>
      )
    }
}

class App extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="App">
        <Switch>
          <Route path='*' component={(props) => <FileExplorer {...props}/> }/>
        </Switch>
      </div>
    )
  }
}

export default App;
