import IJob from '../config/job.interface';

class GeneratePDFJob implements IJob {
  name = 'generatePDF';
  async execute(data: any) {
    console.log(data, 'job do');
  }
}

export default GeneratePDFJob;
