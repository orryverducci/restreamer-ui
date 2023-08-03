import React from 'react';
import urlparser from 'url-parse';

import { faTools } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trans } from '@lingui/macro';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Divider from '@mui/material/Divider';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Checkbox from '../../../misc/Checkbox';
import Select from '../../../misc/Select';
import MultiSelect from '../../../misc/MultiSelect';
import MultiSelectOption from '../../../misc/MultiSelectOption';
import Password from '../../../misc/Password';

const id = 'smooth';
const name = 'Smooth Streaming';
const version = '1.0';
const stream_key_link = '';
const description = (
	<Trans>
		Transmit the main source to a Smooth Streaming Server. More details about the settings can be found{' '}
		<Link color="secondary" target="_blank" href="http://ffmpeg.org/ffmpeg-all.html#mov_002c-mp4_002c-ismv">
			here
		</Link>
		.
	</Trans>
);
const image_copyright = <Trans>Please contact the operator of the service and check what happens.</Trans>;
const author = {
	creator: {
		name: 'datarhei',
		link: 'https://github.com/datarhei',
	},
	maintainer: {
		name: 'datarhei',
		link: 'https://github.com/datarhei',
	},
};
const category = 'universal';
const requires = {
	protocols: ['http', 'https'],
	formats: ['dash'],
	codecs: {
		audio: ['aac'],
		video: ['h264'],
	},
};

function ServiceIcon(props) {
	return <FontAwesomeIcon icon={faTools} style={{ color: 'rgba(57, 181, 74, 1)' }} {...props} />;
}

function init(settings) {
	const initSettings = {
		protocol: 'https://',
		address: '',
		username: '',
		password: '',
		options: {},
		...settings,
	};

	initSettings.options = {
		audio_language: 'eng',
		frag_duration: 2000000,
		frag_size: '',
		min_frag_duration: '',
		movflags: ['frag_keyframe', 'default_base_moof'],
		write_tmcd: '',
		write_btrt: 'auto',
		write_prft: '',
		empty_hdlr_name: false,
		movie_timescale: 1000,
		video_track_timescale: 0,
		...initSettings.options,
	};

	return initSettings;
}

function Service(props) {
	const settings = init(props.settings);

	const handleChange = (what) => (event) => {
		const value = event.target.value;

		if (what in settings.options) {
			if (['empty_hdlr_name'].includes(what)) {
				settings.options[what] = !settings.options[what];
			} else {
				settings.options[what] = value;
			}
		} else {
			settings[what] = value;
		}

		const output = createOutput(settings);

		props.onChange([output], settings);
	};

	const createOutput = (settings) => {
		const options = ['-f', 'ismv', '-avoid_negative_ts', 'make_non_negative'];

		for (let key in settings.options) {
			if (key === 'movflags') {
				let flags = '+isml';

				settings.options[key].forEach((flag) => {
					flags += '+' + flag;
				});

				options.push('-movflags', String(flags));
			} else if (settings.options[key].length === 0) {
				continue;
			} else if (key === 'audio_language') {
				options.push('-metadata:s:a', 'language=' + String(settings.options.audio_language));
			} else if (typeof settings.options[key] === 'boolean') {
				options.push('-' + key, Number(settings.options[key]));
			} else {
				options.push('-' + key, String(settings.options[key]));
			}
		}

		let address = settings.protocol + settings.address;
		if (settings.username.length !== 0 || settings.password.length !== 0) {
			const url = urlparser(address);

			if (settings.username.length !== 0) {
				url.set('username', encodeURIComponent(settings.username));
			}

			if (settings.password.length !== 0) {
				url.set('password', encodeURIComponent(settings.password));
			}

			address = url.toString();
		}

		const output = {
			address: address,
			options: options,
		};

		return output;
	};

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={3}>
				<Select type="select" label={<Trans>Protocol</Trans>} value={settings.protocol} onChange={handleChange('protocol')}>
					<MenuItem value="http://">http://</MenuItem>
					<MenuItem value="https://">https://</MenuItem>
				</Select>
			</Grid>
			<Grid item xs={12} md={9}>
				<TextField variant="outlined" fullWidth label={<Trans>Address</Trans>} value={settings.address} onChange={handleChange('address')} />
			</Grid>
			<Grid item xs={6}>
				<TextField variant="outlined" fullWidth label={<Trans>Username</Trans>} value={settings.username} onChange={handleChange('username')} />
			</Grid>
			<Grid item xs={6}>
				<Password variant="outlined" fullWidth label={<Trans>Password</Trans>} value={settings.password} onChange={handleChange('password')} />
			</Grid>
			<Grid item xs={12}>
				<Accordion className="accordion">
					<AccordionSummary className="accordion-summary" elevation={0} expandIcon={<ArrowDropDownIcon />}>
						<Typography>
							<Trans>Advanced settings</Trans>
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
						<Grid item xs={12}>
								<Typography variant="h3">
									<Trans>Metadata</Trans>
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="Audio Language"
									value={settings.options.audio_language}
									onChange={handleChange('audio_language')}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="h3">
									<Trans>General</Trans>
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<MultiSelect type="select" label="movflags" value={settings.options.movflags} onChange={handleChange('movflags')}>
									<MultiSelectOption value="frag_keyframe" name="frag_keyframe" />
									<MultiSelectOption value="skip_sidx" name="skip_sidx" />
									<MultiSelectOption value="rtphint" name="rtphint" />
									<MultiSelectOption value="omit_tfhd_offset" name="omit_tfhd_offset" />
									<MultiSelectOption value="default_base_moof" name="default_base_moof" />
								</MultiSelect>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="movie_timescale"
									value={settings.options.movie_timescale}
									onChange={handleChange('movie_timescale')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="video_track_timescale"
									value={settings.options.video_track_timescale}
									onChange={handleChange('video_track_timescale')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="write_tmcd"
									value={settings.write_tmcd}
									onChange={handleChange('write_tmcd')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="write_btrt"
									value={settings.write_btrt}
									onChange={handleChange('write_btrt')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="write_prft"
									value={settings.write_prft}
									onChange={handleChange('write_prft')}
								/>
							</Grid>
							<Grid item xs={12}>
								<Checkbox label="empty_hdlr_name" checked={settings.options.empty_hdlr_name} onChange={handleChange('empty_hdlr_name')} />
							</Grid>
							<Grid item xs={12}>
								<Typography variant="h3">
									<Trans>Segmentation</Trans>
								</Typography>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="frag_duration"
									value={settings.options.frag_duration}
									onChange={handleChange('frag_duration')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="frag_size"
									value={settings.options.frag_size}
									onChange={handleChange('frag_size')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									variant="outlined"
									fullWidth
									type="text"
									label="min_frag_duration"
									value={settings.options.min_frag_duration}
									onChange={handleChange('min_frag_duration')}
								/>
							</Grid>
							<Grid item xs={12}>
								<Divider />
							</Grid>
							<Grid item xs={12}>
								<Typography>
									<Trans>Documentation</Trans>{' '}
									<Link color="secondary" target="_blank" href="https://ffmpeg.org/ffmpeg-all.html#dash">
										http://ffmpeg.org/ffmpeg-all.html#mov_002c-mp4_002c-ismv
									</Link>
								</Typography>
							</Grid>
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
		</Grid>
	);
}

Service.defaultProps = {
	settings: {},
	skills: {},
	metadata: {},
	streams: [],
	onChange: function (output, settings) {},
};

export { id, name, version, stream_key_link, description, image_copyright, author, category, requires, ServiceIcon as icon, Service as component };
