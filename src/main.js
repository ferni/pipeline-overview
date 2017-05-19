import 'bootstrap/less/bootstrap.less';
import './styles/main.less';
import Handlebars from 'handlebars';
import background from './background';
import logoImage from './maker_black.svg';
import twitterImage from './twitter_black.svg';
import chatImage from './chat_black.svg';
import githubImage from './github_black.svg';

const templates = {};
const data = pipelineData;

(function addTaskIdsAndColor() {
	let id = 0;
	data.groups.forEach(group => {
		group.tasks.forEach(task => {
			task.id = id++;
			task.colors = group.colors;
		})
	})
}());

function getTaskById(id) {
	let task = null;
	data.groups.forEach(group => {
		group.tasks.forEach(t => {
			if (t.id == id) {
				task = t;
			}
		})
	})
	return task;
}

// Prints the task in the appropiate column according to the stage it is
Handlebars.registerHelper('columnByStage', task => {
	const stageIndex = data.stages.indexOf(task.stage);
	if (stageIndex === -1) {
		throw `Task ${task.name} has an invalid stage: "${task.stage}"`;
	}
	let html = '';
	for (let i = 0; i < data.stages.length; i++) {
		let color = (i % 2) ? task.colors.lightCell : task.colors.darkCell;
		if (i === stageIndex) {
			const link = templates['task-link'](task);
			html += templates['task-column']({
				content: link,
				color
			});
		} else {
			html += templates['task-column']({color});
		}
	}
	return new Handlebars.SafeString(html);
})

// This is used for the rowspan attribute
Handlebars.registerHelper('lengthPlusOne', items => items.length + 1);

document.addEventListener("DOMContentLoaded", () => {
	// Compile templates
	['main', 'task-column', 'task-link', 'task-modal'].forEach(name => {
		const source = document.getElementById(name + "-template").innerHTML;
		templates[name] = Handlebars.compile(source);
	});

	document.getElementById("content").innerHTML = templates['main'](data);

	// todo: fix webpack build and get rid of this
	document.getElementById("logo").setAttribute('src', logoImage);
	document.getElementById("twitter-img").setAttribute('src', twitterImage);
	document.getElementById("chat-img").setAttribute('src', chatImage);
	document.getElementById("github-img").setAttribute('src', githubImage);

	// Bind click events
	document.querySelectorAll('.task-link').forEach(link => {
    link.addEventListener('click', event => {
			// Show task modal
			event.preventDefault();
			const taskId = event.target.dataset.taskId;
			const task = getTaskById(taskId);
			document.getElementById("modals").innerHTML = templates['task-modal'](task);
			background.pause();
			function closeModal(event) {
				event.preventDefault();
				document.getElementById("modals").innerHTML = '';
				background.resume();
			}
			document.getElementById("close-modal-button").addEventListener('click', closeModal);
			document.getElementById("task-modal-overlay").addEventListener('click', closeModal);
    });
	});

	// Animated background
	if (screen.width > 768) {
		background.start({
			colors: data.groups.map(group => group.colors.main),
			lineSeparation: 22,
			lineLength: 20,
			lineWidth: 8,
			tileWidth: 200
		});
	}
});
