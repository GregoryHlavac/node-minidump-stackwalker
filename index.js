var fs = require('fs'),
	cp = require('child_process'),
	path = require('path'),
	os = require('os');

var ospd;

switch(os.platform())
{
	case 'linux':
	{
		if(os.arch() === 'x64')
			ospd = "linux64";
		else
			ospd = "linux";
		break;
	}
	case 'win32':
		ospd = "win32";
		break;
}

function _OSInfo(line) {
	var si = line.split("|");
	this.Name = si[1];
	this.Version = si[2];
}

function _CPUInfo(line) {
	var si = line.split("|");
	this.Architecture = si[1];
	this.Info = si[2];
	this.Count = si[3];
}

function _Crash(line) {
	var si = line.split("|");
	this.Reason = si[1];
	this.Address = si[2];
	this.Thread = si[3];
}

function _Module(line) {
	var si = line.split("|");
	this.Filename           = si[1];
	this.Version            = si[2];
	this.DebugFilename      = si[3];
	this.DebugIdentifier    = si[4];
	this.BaseAddress        = si[5];
	this.MaxAddress         = si[6];
	this.Main               = si[7];
}

function _Frame(line) {
	var si = line.split("|");
	this.ThreadNumber   = si[0];
	this.FrameNumber    = si[1];
	this.Module         = si[2];
	this.Function       = si[3];
	this.SourceFile     = si[4];
	this.Line           = si[5];
	this.Offset         = si[6]
}

function _Minidump(stack_walk) {
	var mdLines = stack_walk.split("\n");

	this.OSInformation = new _OSInfo(mdLines[0]);
	this.CPUInfo = new _CPUInfo(mdLines[1]);
	this.Crash = new _Crash(mdLines[2]);
	this.MainModule = {};
	this.Modules = [];
	this.StackFrames = [];

	var modulesSet = false;

	for(var i = 3; i < mdLines.length; i++)
	{
		if(mdLines[i] === "" && !modulesSet)
			modulesSet = true;
		if(!modulesSet)
		{
			var cm =  new _Module(mdLines[i]);

			if(cm.Main == 1)
				this.MainModule = cm;
			else
				this.Modules[this.Modules.length] = cm
		}
		else if(modulesSet && mdLines[i] !== "")
		{
			this.StackFrames[this.StackFrames.length] = new _Frame(mdLines[i]);
		}
	}
}

module.exports = {
	handleMinidump: function(minidumpFile, symbolPath, callback) {
		cp.execFile("minidump_stackwalk",
			[
				"-m",
				path.resolve(minidumpFile),
				path.resolve(symbolPath)
			],
			{
				cwd: path.resolve(__dirname, "platform_binaries", ospd)
			}, callback
		);
	},
	Minidump : _Minidump,
	OSInfo: _OSInfo,
	CPUInfo: _CPUInfo,
	Crash: _Crash,
	Module: _Module,
	Frame: _Frame
};