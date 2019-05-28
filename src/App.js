import React, { Component } from 'react';
import { Group, Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from 'konva';
import format from 'date-fns/format';
import './App.css';

const MIN_WIDTH = 320;
const MIN_HEIGHT = 480;
const RADIUS_STOP = .45;
const RADIUS = 120;
const RADIUS_FILL = 100;
const CENTER_Y = 240;
const TOTAL_ANIMATED = 160; // Number of animated circles
const TOTAL_SECONDS = 30; // Number of seconds


class App extends Component {
  constructor(props) {
    super(props);
    const updatedStrs = this.updateTime(new Date());
    const width = this.getWidth();
    this.state = {
      width,
      height: this.getHeight(),
      timeString: updatedStrs.timeString,
      dateString: updatedStrs.dateString,
      loading: true,
    };
    this.animate = [];
    this.fillCircles = [];

    this.animatedCircles = this.getAnimatedCircles(width);
    this.secondsCircles = this.getSecondsCircles(width);
  }

  getWidth() {
    return (window.innerWidth > MIN_WIDTH) ? window.innerWidth : MIN_WIDTH;
  }

  getHeight() {
    return (window.innerHeight > MIN_HEIGHT) ? window.innerHeight : MIN_HEIGHT;
  }

  getRadiusStop(width) {
    // if (width < (MIN_WIDTH * 2)) {
    //   return MAX_RADIUS_STOP - (((width-MIN_WIDTH)*(MAX_RADIUS_STOP - RADIUS_STOP))/MIN_WIDTH);
    // }
    return RADIUS_STOP;
  }

  animateFade(idx) {
    if (
      this.animate[idx].opacity() === 0
      && this.animate[idx].animating === false
    ) {
      this.animate[idx].opacity(.5);
      // const { r, g, b } = this.getRandomRGB();
      // this.animate[idx].fill(`rgba(${r}, ${g}, ${b}, .7)`);
      // this.animate[idx].stroke(`rgba(${r}, ${g}, ${b}, 1)`);
      const tw = new Konva.Tween({
        node: this.animate[idx],
        duration: 24,
        radius: 120,
        opacity: 0,
        easing: Konva.Easings.EaseInOut,
        onFinish: function () {
          this.node.radius(2);
          this.node.opacity(0);
          setTimeout(() => {
            this.node.animating = false;
          }, 150);
          this.destroy();
        },
        onPlay: function () {
          this.node.animating = true;
        },
      });
      tw.play();
    }
  }

  loadFonts() {
    window.WebFont.load({
      google: { families: ['Source+Code+Pro:300'] },
      active: () => {
        this.setState({
          loading: false,
        });
      },
    });
  }

  addResizeFunctionality() {
    window.addEventListener('resize', () => {
      const width = this.getWidth();
      this.setState({
        width,
        height: this.getHeight(),
      });
      for (let value = 0; value < TOTAL_SECONDS; value++) {
        const alpha = (-(360 / TOTAL_SECONDS * value) + 90);
        const a = alpha * Math.PI / 180;
        const x = (width/2) + RADIUS_FILL * Math.cos(a);
        this.fillCircles[value].x(x);
      }
      for (let value = 0; value < TOTAL_ANIMATED; value++) {
        const alpha = 360 / TOTAL_ANIMATED * value;
        const a = alpha * Math.PI / 180;
        const x = (width/2) + RADIUS * Math.cos(a);
        this.animate[value].x(x);
      }
    });
  }

  componentWillMount() {
    this.loadFonts()
    this.addResizeFunctionality()
  }

  updateSec(s) {
    if (s%2 === 0) {
      // animate the fadeout
      const idx1 = Math.floor(Math.random()*TOTAL_ANIMATED);
      const idx2 = Math.floor(Math.random()*TOTAL_ANIMATED);
      this.animateFade(idx1);
      setTimeout(() => {
        this.animateFade(idx2);
      }, 750);

      // show the seconds
      const secondsIdx = Math.floor(s/2);
      if (secondsIdx === 0) {
        for(let cFillReset = (TOTAL_SECONDS - 1); cFillReset >= 1; cFillReset--){
          this.fillCircles[cFillReset].stroke('rgba(255, 255, 255, .5)');
          this.fillCircles[cFillReset].fill('rgba(255, 255, 255, 0)');
        }
      } else {
        for(let cFill = secondsIdx; cFill >= 0; cFill--){
          this.fillCircles[cFill].stroke('rgba(255, 255, 255, 0)');
          this.fillCircles[cFill].fill('rgba(255, 255, 255, 1)');
        }
      }
      this.fillCircles[secondsIdx].stroke('rgba(255, 255, 255, 0)');
      this.fillCircles[secondsIdx].fill('rgba(255, 255, 255, 1)');
    }
  }

  updateTime(dt) {
    const timeString = `${format(dt, 'HH:mm')}`;
    const dateString = `${format(dt, 'MM•DD•YYYY')}`;
    return {
      timeString,
      dateString,
    };
  }

  playAnimation() {
    try {
      const dt = new Date();
      this.updateSec(dt.getSeconds());
      const updatedStrs = this.updateTime(dt);

      this.setState({
        timeString: updatedStrs.timeString,
        dateString: updatedStrs.dateString,
      });
      setTimeout(() => {
        this.playAnimation();
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  }

  componentDidMount() {
    this.playAnimation();
  }

  getRandomRGB() {
    const o = Math.round
    const r = Math.random
    const s = 255;
    return {
      r: o(r()*s),
      g: o(r()*s),
      b: o(r()*s),
    };
  }

  getAnimatedCircles(width) {
    const ret = [];
    for (let value = 0; value < TOTAL_ANIMATED; value++) {
      const alpha = 360 / TOTAL_ANIMATED * value;
      const a = alpha * Math.PI / 180;
      const x = (width/2) + RADIUS * Math.cos(a);
      const y = CENTER_Y - RADIUS * Math.sin(a);
      const { r, g, b } = this.getRandomRGB();
      ret.push((
        <Circle
          key={`animated-circle-${value}`}
          ref={(ref) => {
            ref.animating = false;
            this.animate[value] = ref;
          }}
          x={x}
          y={y}
          radius={2}
          fill={`rgba(${r}, ${g}, ${b}, .7)`}
          stroke={`rgba(${r}, ${g}, ${b}, 1)`}
          strokeWidth={1}
          opacity={0}
        />
      ));
    }

    return ret;
  }

  getSecondsCircles(width) {
    const ret = [];
    for (let value = 0; value < TOTAL_SECONDS; value++) {
      const alpha = (-(360 / TOTAL_SECONDS * value) + 90);
      const a = alpha * Math.PI / 180;
      const x = (width/2) + RADIUS_FILL * Math.cos(a);
      const y = CENTER_Y - RADIUS_FILL * Math.sin(a);
      ret.push((
        <Circle
          key={`seconds-circle-${value}`}
          ref={(ref) => {
            this.fillCircles[value] = ref;
          }}
          x={x}
          y={y}
          radius={3}
          strokeWidth={1}
          fill="rgba(255, 255, 255, 0)"
          stroke="rgba(255, 255, 255, .5)"
        />
      ));
    }

    return ret;
  }

  render() {
    const {
      width,
      height,
      timeString,
      dateString,
      loading,
    } = this.state;

    let dateTimeInfo = null;
    if (loading === false) {
      dateTimeInfo = [(
        <Text
          key="time-info"
          x={((width/2) - (RADIUS + 80)/2)}
          y={(CENTER_Y - 40)}
          width={(RADIUS + 80)}
          align="center"
          text={timeString}
          fontSize={40}
          fontFamily="'Source Code Pro', monospace"
          fill="rgba(255, 255, 255, .75)"
        />
      ), (
        <Text
          key="date-info"
          x={((width/2) - (RADIUS + 80)/2)}
          y={(CENTER_Y + 20/2)}
          width={(RADIUS + 80)}
          align="center"
          text={dateString}
          fontSize={20}
          fontFamily="'Source Code Pro', monospace"
          fill="rgba(255, 255, 255, .75)"
        />
      )];
    }

    return (
      <div style={{width, height}}>
        <Stage width={width} height={height}>
          <Layer>
            <Group
              clipFunc={(ctx) => {
                ctx.arc((width/2), (CENTER_Y), (RADIUS + 100), 0, 2 * Math.PI);
              }}
            >
              <Rect
                width={width}
                height={(CENTER_Y*3)}
                fillRadialGradientStartPoint={{x: (width/2), y: 0}}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndPoint={{x: (width/2), y: 0}}
                fillRadialGradientEndRadius={(CENTER_Y*3)}
                fillRadialGradientColorStops={[0, 'rgb(61, 81, 103)', this.getRadiusStop(width), 'rgb(17, 29, 40)']}
              />
              {this.animatedCircles}
              <Circle
                radius={RADIUS}
                x={(width/2)}
                y={CENTER_Y}
                fill="rgb(24, 40, 49)"
                opacity={.7}
                stroke="rgba(134, 134, 134, .2)"
                strokeWidth={4}
              />
              {this.secondsCircles}
            </Group>
            {dateTimeInfo}

            {/*<Rect
              x={(width/2)}
              y={0}
              width={3}
              height={height}
              strokeWidth={1}
              stroke="rgba(255, 0, 0, .2)"
            />*/}
          </Layer>
        </Stage>
      </div>
    );
  }
}

export default App;
