const axes: Axes = {} as Axes;
export default axes;

updateAxes();

window.addEventListener("resize", updateAxes);
window.addEventListener("orientationchange", updateAxes);

function updateAxes() {
  if (window.innerWidth > window.innerHeight) {
    axes.major = window.innerWidth;
    axes.minor = window.innerHeight;
  } else {
    axes.major = window.innerHeight;
    axes.minor = window.innerWidth;
  }
}

interface Axes {
  major: number;
  minor: number;
}
