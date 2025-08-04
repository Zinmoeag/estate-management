import Job from '../config/job.interface';

class sendEmail implements Job {
  name = 'sendEmail';
  async execute(data: any) {
    console.log(data, 'job do');
  }
}

export default sendEmail;
