interface IJob {
  // eslint-disable-next-line no-unused-vars
  execute(data: unknown): Promise<void>;
  name: string;
}

export default IJob;
